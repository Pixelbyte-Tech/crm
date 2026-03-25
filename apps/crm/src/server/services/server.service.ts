import { isNil } from 'lodash';
import { DateTime } from 'luxon';
import { In, Repository } from 'typeorm';
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
import { ServerEntity } from '@crm/database';
import { IntegrationType } from '@crm/types';
import { ServerUpdatedEvent, ServerDeletedEvent, ServerCreatedEvent } from '@crm/kafka';

import { Server } from '../domain';
import { ServerMapper } from '../mappers';
import { IntegrationService } from '../../integration/services';
import { ListServersDto, UpdateServerDto, CreateServerDto } from '../dto';

@Injectable()
export class ServerService {
  constructor(
    private readonly serverMapper: ServerMapper,
    private readonly integrationService: IntegrationService,
    @Inject('KAFKA') private readonly kafka: ClientKafka,
    @InjectRepository(ServerEntity)
    private readonly serverRepo: Repository<ServerEntity>,
  ) {}

  readonly #logger: Logger = new Logger(this.constructor.name);

  /**
   * Fetches a server by its id
   * @param serverId The id of the server to fetch
   */
  async get(serverId: string): Promise<Server> {
    const msg = `Fetching server '${serverId}'`;

    // Find the entity
    const entity = await this.serverRepo.findOne({ where: { id: serverId } });
    if (!entity) {
      this.#logger.error(`${msg} - Failed`);
      throw new NotFoundException(`Failed to find server '${serverId}'`);
    }

    this.#logger.log(`${msg} - Complete`);
    return this.serverMapper.toServer(entity);
  }

  /**
   * Fetches all servers
   * @param dto The list dto
   */
  async list(dto: ListServersDto): Promise<PaginatedResDto<Server>> {
    // Fetch paginated resources
    const entities = await paginate(
      this.serverRepo,
      { limit: dto.limit, page: dto.page },
      {
        where: {
          ...(dto.platform ? { name: In(dto.platform) } : {}),
          ...(dto.monetisation ? { type: In(dto.monetisation) } : {}),
          ...(dto.integrationId ? { integrationId: dto.integrationId } : {}),
          ...(!isNil(dto.enabled) ? { isEnabled: dto.enabled } : {}),
        },
        order: { createdAt: dto.sortDir },
      },
    );

    return {
      data: entities.items.map(this.serverMapper.toServer),
      page: entities.meta.currentPage,
      limit: entities.meta.itemsPerPage,
      total: entities.meta.totalItems,
    };
  }

  /**
   * Creates a new server
   * @param dto The server dto
   * @param req The authenticated request
   */
  async create(dto: CreateServerDto, req?: AuthenticatedReq): Promise<Server> {
    const msg = `Attempting to create '${dto.platform}' server`;

    // Ensure the integration id belongs to a platform integration
    const integration = await this.integrationService.get(dto.integrationId);
    if (!integration) {
      throw new UnprocessableEntityException(`Integration '${dto.integrationId}' not found`);
    }

    if (IntegrationType.TRADING_PLATFORM !== integration.type) {
      throw new UnprocessableEntityException(`Integration must be of type '${IntegrationType.TRADING_PLATFORM}'`);
    }

    // Create and persist the entity
    const entity = await this.serverRepo.save({
      name: dto.name,
      platform: dto.platform,
      monetisation: dto.monetisation,
      isEnabled: dto.isEnabled,
      settings: dto.settings,
      timezone: dto.timezone,
      offsetHours: dto.offsetHours,
      integrationId: dto.integrationId,
    });

    if (!entity) {
      this.#logger.error(`${msg} - Failed`);
      throw new InternalServerErrorException(`Failed to create '${dto.platform}' server`);
    }

    // Build the domain server
    const domainServer = this.serverMapper.toServer(entity);

    // Trigger the creation event
    this.kafka.emit(
      ServerCreatedEvent.type,
      new ServerCreatedEvent(
        {
          serverId: domainServer.id,
          name: domainServer.name,
          platform: domainServer.platform,
          monetisation: domainServer.monetisation,
          isEnabled: domainServer.isEnabled,
          settings: domainServer.settings,
          timezone: domainServer.timezone,
          offsetHours: domainServer.offsetHours,
          integrationId: domainServer.integrationId,
          createdAt: DateTime.fromJSDate(domainServer.createdAt).toMillis(),
        },
        req,
      ),
    );

    this.#logger.log(`${msg} - Complete`);
    return domainServer;
  }

  /**
   * Updates a server by its ID.
   * @param serverId The id of the server to update
   * @param dto The update dto
   * @param req The authenticated request
   */
  async update(serverId: string, dto: UpdateServerDto, req?: AuthenticatedReq): Promise<Server> {
    const msg = `Updating server '${serverId}'`;

    // Ensure the integration id belongs to a platform integration
    if (dto.integrationId) {
      const integration = await this.integrationService.get(dto.integrationId);
      if (!integration) {
        throw new UnprocessableEntityException(`Integration '${dto.integrationId}' not found`);
      }

      if (IntegrationType.TRADING_PLATFORM !== integration.type) {
        throw new UnprocessableEntityException(`Integration must be of type '${IntegrationType.TRADING_PLATFORM}'`);
      }
    }

    // Update the entity by its id
    const result = await this.serverRepo.update(
      { id: serverId },
      {
        ...(dto.name ? { name: dto.name } : {}),
        ...(dto.platform ? { platform: dto.platform } : {}),
        ...(dto.monetisation ? { monetisation: dto.monetisation } : {}),
        ...(!isNil(dto.isEnabled) ? { isEnabled: dto.isEnabled } : {}),
        ...(dto.settings ? { settings: dto.settings as any } : {}),
        ...(dto.timezone ? { timezone: dto.timezone } : {}),
        ...(undefined !== dto.offsetHours ? { offsetHours: dto.offsetHours ?? 0 } : {}),
        ...(dto.integrationId ? { integrationId: dto.integrationId } : {}),
      },
    );

    if (result.affected === 0) {
      this.#logger.error(`${msg} - Failed`);
      throw new UnprocessableEntityException(`Failed to update server '${serverId}'`);
    }

    // Build the domain server
    const domainServer = await this.get(serverId);

    // Trigger the update event
    this.kafka.emit(
      ServerUpdatedEvent.type,
      new ServerUpdatedEvent(
        {
          serverId: domainServer.id,
          name: domainServer.name,
          platform: domainServer.platform,
          monetisation: domainServer.monetisation,
          isEnabled: domainServer.isEnabled,
          settings: domainServer.settings,
          timezone: domainServer.timezone,
          offsetHours: domainServer.offsetHours,
          integrationId: domainServer.integrationId,
          updatedAt: DateTime.fromJSDate(domainServer.updatedAt).toMillis(),
        },
        req,
      ),
    );

    this.#logger.log(`${msg} - Complete`);
    return domainServer;
  }

  /**
   * Deletes an existing server.
   * @param serverId The id of the server to delete
   * @param req The authenticated request
   */
  async delete(serverId: string, req?: AuthenticatedReq): Promise<boolean> {
    const msg = `Deleting server '${serverId}'`;
    this.#logger.log(`${msg} - Start`);

    // Find the entity
    const entity = await this.serverRepo.findOne({ where: { id: serverId } });
    if (!entity) {
      this.#logger.warn(`${msg}. Server not found - Failed`);
      throw new NotFoundException('Server not found');
    }

    // Delete the entity
    const res = await this.serverRepo.delete({ id: entity.id });
    if (!res.affected || res.affected === 0) {
      this.#logger.error(`${msg} - Failed`);
      return false;
    }

    // Trigger the deletion event
    this.kafka.emit(
      ServerDeletedEvent.type,
      new ServerDeletedEvent({ serverId, deletedAt: DateTime.utc().toMillis() }, req),
    );

    return true;
  }
}
