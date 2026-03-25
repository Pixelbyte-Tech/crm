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
import { PlatformClientEntity } from '@crm/database';
import { PlatformClientUpdatedEvent, PlatformClientCreatedEvent, PlatformClientDeletedEvent } from '@crm/kafka';

import { PlatformClient } from '../domain';
import { PlatformClientMapper } from '../mappers';
import { ListPlatformClientsDto, UpdatePlatformClientDto, CreatePlatformClientDto } from '../dto';

@Injectable()
export class PlatformClientService {
  constructor(
    private readonly clientMapper: PlatformClientMapper,
    @Inject('KAFKA') private readonly kafka: ClientKafka,
    @InjectRepository(PlatformClientEntity)
    private readonly clientRepo: Repository<PlatformClientEntity>,
  ) {}

  readonly #logger: Logger = new Logger(this.constructor.name);

  /**
   * Fetches a platform client by its id
   * @param clientId The id of the platform client to fetch
   */
  async get(clientId: string): Promise<PlatformClient> {
    const msg = `Fetching platform client '${clientId}'`;

    // Find the entity
    const entity = await this.clientRepo.findOne({ where: { id: clientId } });
    if (!entity) {
      this.#logger.error(`${msg} - Failed`);
      throw new NotFoundException(`Failed to find platform client '${clientId}'`);
    }

    this.#logger.log(`${msg} - Complete`);
    return this.clientMapper.toClient(entity);
  }

  /**
   * Fetches all platform clients
   * @param dto The list dto
   */
  async list(dto: ListPlatformClientsDto): Promise<PaginatedResDto<PlatformClient>> {
    // Fetch paginated resources
    const entities = await paginate(
      this.clientRepo,
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
      data: entities.items.map(this.clientMapper.toClient),
      page: entities.meta.currentPage,
      limit: entities.meta.itemsPerPage,
      total: entities.meta.totalItems,
    };
  }

  /**
   * Creates a new platform client
   * @param dto The platform client dto
   * @param req The authenticated request
   */
  async create(dto: CreatePlatformClientDto, req?: AuthenticatedReq): Promise<PlatformClient> {
    const msg = `Attempting to create '${dto.platform}' platform client`;

    // Create and persist the entity
    const entity = await this.clientRepo.save({
      type: dto.type,
      platform: dto.platform,
      link: dto.link,
      settings: dto.settings,
    });

    if (!entity) {
      this.#logger.error(`${msg} - Failed`);
      throw new InternalServerErrorException(`Failed to create '${dto.platform}' platform client`);
    }

    // Build the domain user
    const domainClient = this.clientMapper.toClient(entity);

    // Trigger the creation event
    this.kafka.emit(
      PlatformClientCreatedEvent.type,
      new PlatformClientCreatedEvent(
        {
          clientId: domainClient.id,
          type: domainClient.type,
          platform: domainClient.platform,
          link: domainClient.link,
          settings: domainClient.settings,
          createdAt: DateTime.fromJSDate(domainClient.createdAt).toMillis(),
        },
        req,
      ),
    );

    this.#logger.log(`${msg} - Complete`);
    return domainClient;
  }

  /**
   * Updates a platform client by its ID.
   * @param clientId The id of the platform client to update
   * @param dto The update dto
   * @param req The authenticated request
   */
  async update(clientId: string, dto: UpdatePlatformClientDto, req?: AuthenticatedReq): Promise<PlatformClient> {
    const msg = `Updating platform client '${clientId}'`;

    // Update the entity by its id
    const result = await this.clientRepo.update(
      { id: clientId },
      {
        ...(dto.type ? { type: dto.type } : {}),
        ...(dto.platform ? { platform: dto.platform } : {}),
        ...(dto.link ? { link: dto.link } : {}),
        ...(undefined !== dto.settings ? { settings: dto.settings } : {}),
      },
    );

    if (result.affected === 0) {
      this.#logger.error(`${msg} - Failed`);
      throw new UnprocessableEntityException(`Failed to update platform client '${clientId}'`);
    }

    // Build the domain client
    const domainClient = await this.get(clientId);

    // Trigger the update event
    this.kafka.emit(
      PlatformClientUpdatedEvent.type,
      new PlatformClientUpdatedEvent(
        {
          clientId: domainClient.id,
          type: domainClient.type,
          platform: domainClient.platform,
          link: domainClient.link,
          settings: domainClient.settings,
          updatedAt: DateTime.fromJSDate(domainClient.updatedAt).toMillis(),
        },
        req,
      ),
    );

    this.#logger.log(`${msg} - Complete`);
    return domainClient;
  }

  /**
   * Deletes an existing platform client.
   * @param clientId The id of the platform client to delete
   * @param req The authenticated request
   */
  async delete(clientId: string, req?: AuthenticatedReq): Promise<boolean> {
    const msg = `Deleting platform client '${clientId}'`;
    this.#logger.log(`${msg} - Start`);

    // Find the entity
    const entity = await this.clientRepo.findOne({ where: { id: clientId } });
    if (!entity) {
      this.#logger.warn(`${msg}. Platform client not found - Failed`);
      throw new NotFoundException('Platform client not found');
    }

    // Delete the entity
    const res = await this.clientRepo.delete({ id: entity.id });
    if (!res.affected || res.affected === 0) {
      this.#logger.error(`${msg} - Failed`);
      return false;
    }

    // Trigger the deletion event
    this.kafka.emit(
      PlatformClientDeletedEvent.type,
      new PlatformClientDeletedEvent({ clientId, deletedAt: DateTime.utc().toMillis() }, req),
    );

    return true;
  }
}
