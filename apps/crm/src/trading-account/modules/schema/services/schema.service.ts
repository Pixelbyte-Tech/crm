import { isNil } from 'lodash';
import { DateTime } from 'luxon';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate } from 'nestjs-typeorm-paginate';
import { ClientKafka } from '@nestjs/microservices';
import {
  Logger,
  Inject,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  UnprocessableEntityException,
} from '@nestjs/common';

import { PaginatedResDto } from '@crm/http';
import { AuthenticatedReq } from '@crm/auth';
import { TradingAccountSchemaEntity } from '@crm/database';
import {
  TradingAccountSchemaCreatedEvent,
  TradingAccountSchemaDeletedEvent,
  TradingAccountSchemaUpdatedEvent,
} from '@crm/kafka';

import { SchemaMapper } from '../mappers';
import { TradingAccountSchema } from '../domain';
import { ListSchemasDto, UpdateSchemaDto, CreateSchemaDto } from '../dto';

@Injectable()
export class SchemaService {
  constructor(
    private readonly schemaMapper: SchemaMapper,
    @Inject('KAFKA') private readonly kafka: ClientKafka,
    @InjectRepository(TradingAccountSchemaEntity)
    private readonly schemaRepo: Repository<TradingAccountSchemaEntity>,
  ) {}

  readonly #logger: Logger = new Logger(this.constructor.name);

  /**
   * Fetches a schema by its id
   * @param serverId The server to which the schema is assigned
   * @param schemaId The id of the schema to fetch
   */
  async get(serverId: string, schemaId: string): Promise<TradingAccountSchema> {
    const msg = `Fetching schema '${schemaId}'`;

    // Find the entity
    const entity = await this.schemaRepo.findOne({ where: { id: schemaId, serverId } });
    if (!entity) {
      this.#logger.error(`${msg} - Failed`);
      throw new NotFoundException(`Failed to find schema '${schemaId}'`);
    }

    this.#logger.log(`${msg} - Complete`);
    return this.schemaMapper.toSchema(entity);
  }

  /**
   * Lists schemas based on filter criteria.
   * @param serverId The server for which to list schemas
   * @param dto The list dto
   */
  async list(serverId: string, dto: ListSchemasDto): Promise<PaginatedResDto<TradingAccountSchema>> {
    const qb = this.schemaRepo.createQueryBuilder('s').orderBy({ createdAt: dto.sortDir });
    qb.where('s."serverId" = :serverId', { serverId });

    if (!isNil(dto.isEnabled)) {
      qb.andWhere('s."isEnabled" = :isEnabled', { isEnabled: dto.isEnabled });
    }

    if (!isNil(dto.isKycRequired)) {
      qb.andWhere('s."isKycRequired" = :isKycRequired', { isKycRequired: dto.isKycRequired });
    }

    if (dto.allowedLeverages?.length) {
      const vals = dto.allowedLeverages.map((l) => `${l}`).join(', ');
      qb.andWhere(`s."allowedLeverages" && ARRAY[${vals}]`);
    }

    if (dto.allowedCurrencies?.length) {
      const vals = dto.allowedCurrencies.map((l) => `${l}`).join(', ');
      qb.andWhere(`s."allowedCurrencies" && ARRAY[${vals}]`);
    }

    if (dto.allowedCountries?.length) {
      const vals = dto.allowedCountries.map((l) => `${l}`).join(', ');
      qb.andWhere(`s."allowedCountries" && ARRAY[${vals}]`);
    }

    if (dto.excludedCountries?.length) {
      const vals = dto.excludedCountries.map((l) => `${l}`).join(', ');
      qb.andWhere(`s."excludedCountries" && ARRAY[${vals}]`);
    }

    if (dto.minDepositAmountUsd) {
      qb.andWhere('s."minDepositAmountUsd" = :minDepositAmountUsd', { minDepositAmountUsd: dto.minDepositAmountUsd });
    }

    if (dto.maxDepositAmountUsd) {
      qb.andWhere('s."maxDepositAmountUsd" = :maxDepositAmountUsd', { maxDepositAmountUsd: dto.maxDepositAmountUsd });
    }

    if (dto.maxAccountsPerUser) {
      qb.andWhere('s."maxAccountsPerUser" = :maxAccountsPerUser', { maxAccountsPerUser: dto.maxAccountsPerUser });
    }

    // Fetch paginated resources
    const entities = await paginate(qb, { limit: dto.limit, page: dto.page });

    return {
      data: entities.items.map(this.schemaMapper.toSchema),
      page: entities.meta.currentPage,
      limit: entities.meta.itemsPerPage,
      total: entities.meta.totalItems,
    };
  }

  /**
   * Creates a new schema
   * @param serverId The server to which the schema should be assigned
   * @param dto The schema dto
   * @param req The authenticated request
   */
  async create(serverId: string, dto: CreateSchemaDto, req?: AuthenticatedReq): Promise<TradingAccountSchema> {
    const msg = `Attempting to create schema`;

    // Create and persist the entity
    const entity = await this.schemaRepo.save({
      serverId,
      name: dto.name,
      description: dto.description,
      isEnabled: dto.isEnabled,
      isPoiRequired: dto.isPoiRequired,
      isPowRequired: dto.isPowRequired,
      allowedLeverages: dto.allowedLeverages,
      allowedCurrencies: dto.allowedCurrencies,
      allowedCountries: dto.allowedCountries,
      excludedCountries: dto.excludedCountries,
      minDepositAmountUsd: dto.minDepositAmountUsd,
      maxDepositAmountUsd: dto.maxDepositAmountUsd,
      maxAccountsPerUser: dto.maxAccountsPerUser,
      platformUserGroupId: dto.platformUserGroupId,
      leverageOverwrites:
        dto.leverageOverwrites?.map((l) => ({
          leverages: l.leverages,
          allowedCountries: l.allowedCountries ?? undefined,
          excludedCountries: l.excludedCountries ?? undefined,
        })) ?? undefined,
    });
    if (!entity) {
      this.#logger.error(`${msg} - Failed`);
      throw new InternalServerErrorException(`Failed to create schema`);
    }

    // Build the domain model
    const domainSchema = this.schemaMapper.toSchema(entity);

    // Trigger the creation event
    this.kafka.emit(
      TradingAccountSchemaCreatedEvent.type,
      new TradingAccountSchemaCreatedEvent(
        {
          schemaId: domainSchema.id,
          serverId,
          name: dto.name,
          description: domainSchema.description,
          isEnabled: domainSchema.isEnabled,
          isPoiRequired: domainSchema.isPoiRequired,
          isPowRequired: domainSchema.isPowRequired,
          allowedLeverages: domainSchema.allowedLeverages,
          leverageOverwrites: domainSchema.leverageOverwrites,
          allowedCurrencies: domainSchema.allowedCurrencies,
          allowedCountries: domainSchema.allowedCountries,
          excludedCountries: domainSchema.excludedCountries,
          minDepositAmountUsd: domainSchema.minDepositAmountUsd,
          maxDepositAmountUsd: domainSchema.maxDepositAmountUsd,
          maxAccountsPerUser: domainSchema.maxAccountsPerUser,
          platformUserGroupId: domainSchema.platformUserGroupId,
          createdAt: DateTime.fromJSDate(domainSchema.createdAt).toMillis(),
        },
        req,
      ),
    );

    this.#logger.log(`${msg} - Complete`);
    return domainSchema;
  }

  /**
   * Updates a schema by its ID.
   * @param serverId The server to which the schema is assigned
   * @param schemaId The id of the schema to update
   * @param dto The update dto
   * @param req The authenticated request
   */
  async update(
    serverId: string,
    schemaId: string,
    dto: UpdateSchemaDto,
    req?: AuthenticatedReq,
  ): Promise<TradingAccountSchema> {
    const msg = `Updating schema '${schemaId}'`;

    // Update the entity by its id
    const result = await this.schemaRepo.update(
      { id: schemaId, serverId },
      {
        ...(dto.name ? { name: dto.name } : {}),
        ...(undefined !== dto.description ? { description: dto.description } : {}),
        ...(!isNil(dto.isEnabled) ? { isEnabled: dto.isEnabled } : {}),
        ...(!isNil(dto.isPoiRequired) ? { isPoiRequired: dto.isPoiRequired } : {}),
        ...(!isNil(dto.isPowRequired) ? { isPowRequired: dto.isPowRequired } : {}),
        ...(undefined !== dto.allowedLeverages ? { allowedLeverages: dto.allowedLeverages } : {}),
        ...(undefined !== dto.allowedCurrencies ? { allowedCurrencies: dto.allowedCurrencies } : {}),
        ...(undefined !== dto.allowedCountries ? { allowedCountries: dto.allowedCountries } : {}),
        ...(undefined !== dto.excludedCountries ? { excludedCountries: dto.excludedCountries } : {}),
        ...(undefined !== dto.minDepositAmountUsd ? { minDepositAmountUsd: dto.minDepositAmountUsd } : {}),
        ...(undefined !== dto.maxDepositAmountUsd ? { maxDepositAmountUsd: dto.maxDepositAmountUsd } : {}),
        ...(undefined !== dto.maxAccountsPerUser ? { maxAccountsPerUser: dto.maxAccountsPerUser } : {}),
        ...(dto.platformUserGroupId ? { platformUserGroupId: dto.platformUserGroupId } : {}),
        leverageOverwrites:
          dto.leverageOverwrites?.map((l) => ({
            leverages: l.leverages,
            allowedCountries: l.allowedCountries ?? undefined,
            excludedCountries: l.excludedCountries ?? undefined,
          })) ?? undefined,
      },
    );

    if (result.affected === 0) {
      this.#logger.error(`${msg} - Failed`);
      throw new UnprocessableEntityException(`Failed to update schema '${schemaId}'`);
    }

    // Build the domain model
    const domainSchema = await this.get(serverId, schemaId);

    // Trigger the update event
    this.kafka.emit(
      TradingAccountSchemaUpdatedEvent.type,
      new TradingAccountSchemaUpdatedEvent(
        {
          schemaId: domainSchema.id,
          serverId,
          name: domainSchema.name,
          description: domainSchema.description,
          isEnabled: domainSchema.isEnabled,
          isPoiRequired: domainSchema.isPoiRequired,
          isPowRequired: domainSchema.isPowRequired,
          allowedLeverages: domainSchema.allowedLeverages,
          leverageOverwrites: domainSchema.leverageOverwrites,
          allowedCurrencies: domainSchema.allowedCurrencies,
          allowedCountries: domainSchema.allowedCountries,
          excludedCountries: domainSchema.excludedCountries,
          minDepositAmountUsd: domainSchema.minDepositAmountUsd,
          maxDepositAmountUsd: domainSchema.maxDepositAmountUsd,
          maxAccountsPerUser: domainSchema.maxAccountsPerUser,
          platformUserGroupId: domainSchema.platformUserGroupId,
          updatedAt: DateTime.fromJSDate(domainSchema.updatedAt).toMillis(),
        },
        req,
      ),
    );

    this.#logger.log(`${msg} - Complete`);
    return domainSchema;
  }

  /**
   * Deletes an existing schema
   * @param serverId The server to which the schema is assigned
   * @param schemaId The id of the schema to delete
   * @param req The authenticated request
   */
  async delete(serverId: string, schemaId: string, req?: AuthenticatedReq): Promise<boolean> {
    const msg = `Deleting schema '${schemaId}'`;
    this.#logger.log(`${msg} - Start`);

    // Find the entity
    const entity = await this.schemaRepo.findOne({ where: { id: schemaId, serverId } });
    if (!entity) {
      this.#logger.warn(`${msg}. Schema not found - Failed`);
      throw new NotFoundException('Schema not found');
    }

    // Delete the entity
    const res = await this.schemaRepo.delete({ id: entity.id });
    if (!res.affected || res.affected === 0) {
      this.#logger.error(`${msg} - Failed`);
      return false;
    }

    // Trigger the deletion event
    this.kafka.emit(
      TradingAccountSchemaDeletedEvent.type,
      new TradingAccountSchemaDeletedEvent({ schemaId, deletedAt: DateTime.utc().toMillis() }, req),
    );

    return true;
  }
}
