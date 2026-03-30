import { Queue } from 'bull';
import { DateTime } from 'luxon';
import { InjectQueue } from '@nestjs/bull';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate } from 'nestjs-typeorm-paginate';
import { ClientKafka } from '@nestjs/microservices';
import { In, Between, Repository, EntityManager, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import {
  Logger,
  Inject,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  UnprocessableEntityException,
} from '@nestjs/common';

import { GeoService } from '@crm/geo';
import { PaginatedResDto } from '@crm/http';
import { AuthenticatedReq } from '@crm/auth';
import { Cryptography, securePassword } from '@crm/utils';
import { PlatformFactory, BalanceOperation } from '@crm/platform';
import { Gender, Platform, TradingAccountStatus } from '@crm/types';
import { Balance as PlatformBalance, UserGroup as PlatformUserGroup } from '@crm/platform';
import { TradingAccountCreatedEvent, TradingAccountDeletedEvent, TradingAccountUpdatedEvent } from '@crm/kafka';
import {
  UserEntity,
  ServerEntity,
  UserDetailEntity,
  TradingAccountEntity,
  TradingAccountSchemaEntity,
} from '@crm/database';

import { GetTradingAccountDto } from '../dto/in/get-trading-account.dto';

import { JobType } from '../types';
import { TradingAccount } from '../domain';
import { TradingAccountMapper } from '../mappers';
import { PlatformServerFactory } from '../../common/services';
import { ListTradingAccountsDto, UpdateTradingAccountDto, CreateTradingAccountDto } from '../dto';
import { SchemaConflictException, SchemaNotEnabledException, MonetisationMismatchException } from '../exceptions';

@Injectable()
export class TradingAccountService {
  constructor(
    private readonly geoService: GeoService,
    private readonly platformFactory: PlatformFactory,
    private readonly platformServerFactory: PlatformServerFactory,
    private readonly tradingAccMapper: TradingAccountMapper,
    @Inject('KAFKA') private readonly kafka: ClientKafka,
    @InjectQueue('trading-account-queue') private readonly queue: Queue,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(ServerEntity)
    private readonly serverRepo: Repository<ServerEntity>,
    @InjectRepository(TradingAccountEntity)
    private readonly tradingAccRepo: Repository<TradingAccountEntity>,
    @InjectRepository(TradingAccountSchemaEntity)
    private readonly schemaRepo: Repository<TradingAccountSchemaEntity>,
  ) {}

  readonly #logger: Logger = new Logger(this.constructor.name);

  /**
   * Fetches a trading account by its id
   * @param tradingAccountId The id of the trading account to fetch
   * @param dto The payload dto
   */
  async get(tradingAccountId: string, dto?: GetTradingAccountDto): Promise<TradingAccount> {
    const msg = `Fetching trading account '${tradingAccountId}'`;

    // Find the entity
    const entity = await this.tradingAccRepo.findOne({
      relations: { tradingAccountTags: true, server: true },
      where: { id: tradingAccountId },
    });
    if (!entity) {
      this.#logger.error(`${msg} - Failed`);
      throw new NotFoundException(`Failed to find trading account '${tradingAccountId}'`);
    }

    let balance: PlatformBalance | undefined;
    let userGroup: PlatformUserGroup | undefined;
    if (dto?.incBalance || dto?.incUserGroup) {
      const platformServer = this.platformServerFactory.toPlatformServer(entity.server);
      const platform = this.platformFactory.get(platformServer);

      // If the balance is required
      if (dto?.incBalance) {
        balance = await platform.getBalance(entity.platformId);
      }

      // If the user group is required
      if (dto?.incUserGroup) {
        const account = await platform.getAccount(entity.platformId);
        userGroup = (await platform.getUserGroup(account.platformUserGroupId)) ?? undefined;
      }
    }

    this.#logger.log(`${msg} - Complete`);
    return this.tradingAccMapper.toTradingAcc(entity, userGroup, balance);
  }

  /**
   * Lists trading accounts based on filter criteria.
   * @param dto The list dto
   */
  async list(dto: ListTradingAccountsDto): Promise<PaginatedResDto<TradingAccount>> {
    // Fetch paginated resources
    const entities = await paginate(
      this.tradingAccRepo,
      { limit: dto.limit, page: dto.page },
      {
        relations: { tradingAccountTags: true, server: true },
        where: {
          ...(dto.registeredAtFrom && dto.registeredAtTo
            ? { registeredAt: Between(dto.registeredAtFrom, dto.registeredAtTo) }
            : {
                ...(dto.registeredAtFrom ? { registeredAt: MoreThanOrEqual(dto.registeredAtFrom) } : {}),
                ...(dto.registeredAtTo ? { registeredAt: LessThanOrEqual(dto.registeredAtTo) } : {}),
              }),
          ...(dto.userId ? { userId: dto.userId } : {}),
          ...(dto.status?.length ? { status: In(dto.status) } : {}),
          ...(dto.platform?.length ? { platform: In(dto.platform) } : {}),
          ...(dto.monetisation?.length ? { monetisation: In(dto.monetisation) } : {}),
          ...(dto.integrationId ? { integrationId: dto.integrationId } : {}),
          ...(dto.serverId ? { serverId: dto.serverId } : {}),
          ...(dto.schemaId ? { schemaId: dto.schemaId } : {}),
        },
        order: { registeredAt: dto.sortDir },
      },
    );

    if (dto.incBalance || dto.incUserGroup) {
      // Create a map of server id to platform account ids
      // so we can batch our requests to the platforms
      const serverMap: Map<string, string[]> = new Map();
      entities.items.forEach((item) => {
        const tmp = serverMap.get(item.serverId) ?? [];
        if (!tmp.length) serverMap.set(item.serverId, tmp);
        tmp.push(item.platformId);
      });

      // Create required placeholders
      const balancesMap: Map<string, PlatformBalance> = new Map();
      const userGroupMap: Map<string, PlatformUserGroup> = new Map();

      // Fetch all servers entities needed
      const servers = await this.serverRepo.find({ where: { id: In(Array.from(serverMap.keys())) } });

      for (const [serverId, platformAccountIds] of serverMap.entries()) {
        // Find the server we need
        const server = servers.find((s) => s.id === serverId);
        if (!server) {
          const msg = `Server '${serverId}' not found - Skipping balance and user group data for related accounts`;
          this.#logger.warn(msg);
          continue;
        }

        // Create a connection to the platform for this server
        const platformServer = this.platformServerFactory.toPlatformServer(server);
        const platform = this.platformFactory.get(platformServer);

        // Handle getting balance data
        if (dto.incBalance) {
          // Fetch all balances for this server and add to map
          const balances = await platform.getBalances(platformAccountIds);
          balances.forEach((b) => balancesMap.set(b.platformAccountId, b));
        }

        // Handle getting user group data
        if (dto.incUserGroup) {
          // Fetch all accounts
          const accounts = await platform.getAccounts(platformAccountIds);

          // Iterate distinct user group ids of each account
          for (const userGroupId of [...new Set(accounts.map((a) => a.platformUserGroupId))]) {
            const userGroup = await platform.getUserGroup(userGroupId);
            if (!userGroup) {
              const msg = `User group '${userGroupId}' not found - Skipping user group data for related accounts`;
              this.#logger.warn(msg);
              continue;
            }

            // Add user groups to map
            const candidates = accounts.filter((a) => a.platformUserGroupId === userGroupId);
            candidates.forEach((a) => userGroupMap.set(a.platformAccountId, userGroup));
          }
        }
      }

      return {
        data: entities.items.map((item) =>
          this.tradingAccMapper.toTradingAcc(item, userGroupMap.get(item.platformId), balancesMap.get(item.platformId)),
        ),
        page: entities.meta.currentPage,
        limit: entities.meta.itemsPerPage,
        total: entities.meta.totalItems,
      };
    }

    return {
      data: entities.items.map((item) => this.tradingAccMapper.toTradingAcc(item)),
      page: entities.meta.currentPage,
      limit: entities.meta.itemsPerPage,
      total: entities.meta.totalItems,
    };
  }

  /**
   * Creates a new trading account
   * @param dto The trading account dto
   * @param req The authenticated request
   */
  async create(dto: CreateTradingAccountDto, req?: AuthenticatedReq): Promise<TradingAccount> {
    const msg = `Attempting to create trading account for user '${dto.userId}' via schema '${dto.schemaId}'`;

    // Fetch the schema
    const schema = await this.schemaRepo.findOne({ where: { id: dto.schemaId } });
    if (!schema) {
      this.#logger.error(`${msg}. Schema '${dto.schemaId}' not found - Failed`);
      throw new NotFoundException(`Schema '${dto.schemaId}' not found`);
    }

    // Fetch the user along with user details
    const user = await this.userRepo.findOne({ relations: { detail: true }, where: { id: dto.userId } });
    if (!user) {
      this.#logger.error(`${msg}. User '${dto.userId}' not found - Failed`);
      throw new NotFoundException(`User '${dto.userId}' not found`);
    }

    // Check if the schema is enabled
    if (!schema.isEnabled) {
      this.#logger.error(`${msg}. Schema '${schema.name}' is currently disabled - Failed`);
      throw new SchemaNotEnabledException(schema.name);
    }

    // Fetch the server being requested
    const server = await this.serverRepo.findOne({ where: { id: schema.serverId } });
    if (!server) {
      this.#logger.error(`${msg}. Server '${schema.serverId}' not found - Failed`);
      throw new UnprocessableEntityException(`Server '${schema.serverId}' not found`);
    }

    // Ensure the monetisation of the trading account and server match
    if (server.monetisation !== dto.monetisation) {
      this.#logger.error(`${msg}. Monetisation mismatch - Failed`);
      throw new MonetisationMismatchException(dto.monetisation, server.monetisation);
    }

    // Check if the schema is respected
    await this.#testSchemaConflicts(dto.leverage, dto.userId, schema, dto.currency, user.detail, req);

    // Initialise a connection to the platform
    const platformServer = this.platformServerFactory.toPlatformServer(server);
    const platform = this.platformFactory.get(platformServer);

    // Find the user group for this account
    const userGroup = await platform.getUserGroup(schema.platformUserGroupId);
    if (!userGroup) {
      throw new UnprocessableEntityException(`Cannot find user group '${schema.platformUserGroupId}' on platform`);
    }

    // Prepare any additional data for the request
    let additionalData: Record<string, any> | undefined;
    if (Platform.TL === server.platform) {
      const num = await this.tradingAccRepo.count({ where: { userId: dto.userId, serverId: schema.serverId } });
      additionalData = { idempotencyKey: Cryptography.hash(`${dto.userId}-${schema.serverId}-${num}`) };
    }

    // Create the account on the platform
    const platformAccount = await platform.createAccount(
      {
        tenantUserId: dto.userId,
        leverage: dto.leverage,
        currency: dto.currency,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: dto.password ?? securePassword(),
        gender: user.detail?.gender ?? Gender.MALE,
        language: user.detail?.language ?? 'en',
        monetisation: dto.monetisation,
        friendlyName: dto.friendlyName,
        address: user.detail?.addressLine1 ?? undefined,
        city: user.detail?.city ?? undefined,
        zipcode: user.detail?.postcode ?? undefined,
        state: user.detail?.state ?? undefined,
        country: user.detail?.country ?? undefined,
        phone: user.detail?.phone ?? undefined,
        readonlyPassword: securePassword(),
        phonePassword: securePassword(),
        leadSource: dto.leadSource,
        additionalData,
      },
      { id: userGroup.platformGroupId, name: userGroup.name },
    );

    let entity: TradingAccountEntity;

    try {
      // Create and persist the entity
      entity = await this.tradingAccRepo.save({
        userId: dto.userId,
        schemaId: dto.schemaId,
        serverId: server.id,
        platformId: platformAccount.platformAccountId,
        platformUserId: platformAccount.platformUserId,
        platformAccountName: platformAccount.platformAccountName,
        friendlyName: dto.friendlyName,
        platform: server.platform,
        monetisation: dto.monetisation,
        status: TradingAccountStatus.ACTIVE,
        currency: dto.currency,
        leverage: dto.leverage,
        login: platformAccount.masterCredential.login,
        password: Cryptography.encrypt(platformAccount.masterCredential.password),
      });
    } catch (err) {
      this.#logger.error(`${msg} - Failed`, err);
      throw new InternalServerErrorException(
        `Failed to create '${server.platform}' trading account for user '${dto.userId}'`,
        { cause: err },
      );
    }

    // Build the domain model
    const domainTradingAcc = this.tradingAccMapper.toTradingAcc(entity);

    // Trigger the creation event
    this.kafka.emit(
      TradingAccountCreatedEvent.type,
      new TradingAccountCreatedEvent(
        {
          tradingAccountId: domainTradingAcc.id,
          userId: domainTradingAcc.userId,
          schemaId: domainTradingAcc.schemaId,
          serverId: domainTradingAcc.serverId,
          platformId: domainTradingAcc.platformId,
          platformUserId: domainTradingAcc.platformUserId,
          platformAccountName: domainTradingAcc.platformAccountName,
          friendlyName: domainTradingAcc.friendlyName,
          platform: domainTradingAcc.platform,
          monetisation: domainTradingAcc.monetisation,
          status: domainTradingAcc.status,
          leverage: domainTradingAcc.leverage,
          currency: domainTradingAcc.currency,
          registeredAt: DateTime.fromJSDate(domainTradingAcc.registeredAt).toMillis(),
          login: domainTradingAcc.login,
          password: domainTradingAcc.password,
          createdAt: DateTime.fromJSDate(domainTradingAcc.createdAt).toMillis(),
        },
        req,
      ),
    );

    this.#logger.log(`${msg} - Complete`);
    return domainTradingAcc;
  }

  /**
   * Updates a trading account by its ID.
   * @param tradingAccountId The id of the trading account to update
   * @param dto The update dto
   * @param req The authenticated request
   */
  async update(
    tradingAccountId: string,
    dto: UpdateTradingAccountDto,
    req?: AuthenticatedReq,
  ): Promise<TradingAccount> {
    const msg = `Updating trading account '${tradingAccountId}'`;

    // Find the original trading account
    const tradingAccount = await this.tradingAccRepo.findOne({
      relations: { schema: true },
      where: { id: tradingAccountId },
    });
    if (!tradingAccount) {
      this.#logger.error(`${msg}. Trading account not found - Failed`);
      throw new NotFoundException(`Trading account '${tradingAccountId}' not found`);
    }

    // Fetch the server being requested
    const server = await this.serverRepo.findOne({ where: { id: tradingAccount.serverId } });
    if (!server) {
      this.#logger.error(`${msg}. Server '${tradingAccount.serverId}' not found - Failed`);
      throw new UnprocessableEntityException(`Server '${tradingAccount.serverId}' not found`);
    }

    // Check if the schema is respected
    if (dto.leverage) {
      await this.#testSchemaConflicts(dto.leverage, tradingAccount.userId, tradingAccount.schema);
    }

    // Initialise a connection to the platform
    const platformServer = this.platformServerFactory.toPlatformServer(server);
    const platform = this.platformFactory.get(platformServer);

    // Update the entity locally and on the platform
    const result = await this.tradingAccRepo.manager.transaction(async (tx: EntityManager) => {
      const result = await tx.update(
        TradingAccountEntity,
        { id: tradingAccountId },
        {
          ...(dto.status ? { status: dto.status } : {}),
          ...(dto.leverage ? { leverage: dto.leverage } : {}),
          ...(dto.friendlyName ? { friendlyName: dto.friendlyName } : {}),
        },
      );

      // Update the account on the platform
      const isSuspended = dto.status ? TradingAccountStatus.SUSPENDED === dto.status : undefined;
      await platform.updateAccount({ leverage: dto.leverage, isSuspended }, tradingAccount.platformId);

      return result;
    });

    if (result.affected === 0) {
      this.#logger.error(`${msg} - Failed`);
      throw new UnprocessableEntityException(`Failed to update trading account '${tradingAccountId}'`);
    }

    // Build the domain model
    const domainTradingAcc = await this.get(tradingAccountId);

    // Trigger the update event
    this.kafka.emit(
      TradingAccountUpdatedEvent.type,
      new TradingAccountUpdatedEvent(
        {
          tradingAccountId: domainTradingAcc.id,
          userId: domainTradingAcc.userId,
          schemaId: domainTradingAcc.schemaId,
          serverId: domainTradingAcc.serverId,
          platformId: domainTradingAcc.platformId,
          platformUserId: domainTradingAcc.platformUserId,
          platformAccountName: domainTradingAcc.platformAccountName,
          friendlyName: domainTradingAcc.friendlyName,
          platform: domainTradingAcc.platform,
          monetisation: domainTradingAcc.monetisation,
          status: domainTradingAcc.status,
          leverage: domainTradingAcc.leverage,
          currency: domainTradingAcc.currency,
          registeredAt: DateTime.fromJSDate(domainTradingAcc.registeredAt).toMillis(),
          login: domainTradingAcc.login,
          password: domainTradingAcc.password,
          updatedAt: DateTime.fromJSDate(domainTradingAcc.updatedAt).toMillis(),
        },
        req,
      ),
    );

    this.#logger.log(`${msg} - Complete`);
    return domainTradingAcc;
  }

  /**
   * Deletes an existing trading account.
   * @param tradingAccountId The id of the trading account to delete
   * @param req The authenticated request
   */
  async delete(tradingAccountId: string, req?: AuthenticatedReq): Promise<boolean> {
    const msg = `Deleting trading account '${tradingAccountId}'`;
    this.#logger.log(`${msg} - Start`);

    // Find the entity
    const entity = await this.tradingAccRepo.findOne({ relations: { server: true }, where: { id: tradingAccountId } });
    if (!entity) {
      this.#logger.error(`${msg}. Trading account not found - Failed`);
      throw new NotFoundException('Trading account not found');
    }

    // Initialise a connection to the platform
    const platformServer = this.platformServerFactory.toPlatformServer(entity.server);
    const platform = this.platformFactory.get(platformServer);

    const result = await this.tradingAccRepo.manager.transaction(async (tx: EntityManager) => {
      // Delete the entity
      const res = await tx.delete(TradingAccountEntity, { id: entity.id });
      if (!res.affected || res.affected === 0) {
        this.#logger.error(`${msg} - Failed`);
        return false;
      }

      // Close all active trades
      const ctResult = await platform.closeAllTrades(entity.platformId);
      if (!ctResult.positionsStatus) {
        this.#logger.error(`${msg}. Unable to close open positions - Failed`, { res: ctResult.positionsResults });
        throw new UnprocessableEntityException('Unable to close open positions');
      }

      // Record the current balance
      const balance = await platform.getBalance(entity.platformId);

      // Zero the trading account balance
      const comment = `Account deleted. Balance transferred to PixelByte CRM wallet.`;
      const balanceRes = await platform.updateBalance(
        BalanceOperation.SUB,
        balance.withdrawable,
        comment,
        entity.platformId,
      );

      // Credit back to wallet and delete from platform
      if (balanceRes) {
        // todo credit back into wallet

        // Delete the account
        await platform.deleteAccount(entity.platformId);
      }

      // Trigger the deletion event
      this.kafka.emit(
        TradingAccountDeletedEvent.type,
        new TradingAccountDeletedEvent({ tradingAccountId, deletedAt: DateTime.utc().toMillis() }, req),
      );

      return true;
    });

    if (!result) {
      this.#logger.log(`${msg}. Scheduling deletion retry`);
      await this.queue.add(JobType.DELETE_ACCOUNT, { tradingAccountId });
    }

    return result;
  }

  /**
   * Tests whether trading account settings respect the schema restrictions
   * @param leverage The leverage requested
   * @param userId The user id of the owner of the trading account
   * @param currency The currency requested
   * @param schema The trading account schema
   * @param userDetail The user detail entity
   * @param req The original request
   * @throws SchemaConflictException If the settings conflict with the schema
   */
  async #testSchemaConflicts(
    leverage: number,
    userId: string,
    schema?: TradingAccountSchemaEntity | null,
    currency?: string,
    userDetail?: UserDetailEntity | null,
    req?: AuthenticatedReq,
  ): Promise<void> {
    // Skip checks if no schema is used
    if (!schema) return;

    // Test leverage
    if (!schema.allowedLeverages?.includes(leverage)) {
      throw new SchemaConflictException(schema.name, 'leverage');
    }

    // Test currency
    if (currency && !schema.allowedCurrencies?.includes(currency)) {
      throw new SchemaConflictException(schema.name, 'currency');
    }

    // Test POI & POW
    if (schema.isPoiRequired && !userDetail?.isPoiVerified) {
      throw new SchemaConflictException(schema.name, 'POI not verified');
    }
    if (schema.isPowRequired && !userDetail?.isPowVerified) {
      throw new SchemaConflictException(schema.name, 'POW not verified');
    }

    // If no IP can be found, allow request
    if (!req?.ip) return;

    // Test geolocation
    if (schema.allowedCountries?.length || schema.excludedCountries?.length) {
      const country = this.geoService.get(req.ip).country?.isoCode;
      if (!country) {
        throw new SchemaConflictException(schema.name, 'geolocation error');
      }

      if (schema.excludedCountries?.length && schema.excludedCountries.includes(country)) {
        throw new SchemaConflictException(schema.name, 'excludedCountries');
      }

      if (schema.allowedCountries?.length && !schema.allowedCountries.includes(country)) {
        throw new SchemaConflictException(schema.name, 'allowedCountries');
      }
    }

    // Test number of accounts
    if (schema.maxAccountsPerUser) {
      const num = await this.tradingAccRepo.count({ where: { userId, schemaId: schema.id } });
      if (num >= schema.maxAccountsPerUser) {
        throw new SchemaConflictException(schema.name, 'maxAccountsPerUser');
      }
    }
  }
}
