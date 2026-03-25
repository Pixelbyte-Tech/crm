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
import { IntegrationEntity } from '@crm/database';
import { Integration, IntegrationName, IntegrationType } from '@crm/types';
import { IntegrationCreatedEvent, IntegrationUpdatedEvent, IntegrationDeletedEvent } from '@crm/kafka';

import { IntegrationMapper } from '../mappers';
import { UnknownIntegrationNameException } from '../exceptions';
import { ListIntegrationsDto, UpdateIntegrationDto, CreateIntegrationDto } from '../dto';

@Injectable()
export class IntegrationService {
  constructor(
    private readonly integrationMapper: IntegrationMapper,
    @Inject('KAFKA') private readonly kafka: ClientKafka,
    @InjectRepository(IntegrationEntity)
    private readonly integrationRepo: Repository<IntegrationEntity>,
  ) {}

  readonly #logger: Logger = new Logger(this.constructor.name);

  /**
   * Fetches an integration by its id
   * @param integrationId The id of the integration to fetch
   */
  async get(integrationId: string): Promise<Integration> {
    const msg = `Fetching integration '${integrationId}'`;

    // Find the entity
    const entity = await this.integrationRepo.findOne({ where: { id: integrationId } });
    if (!entity) {
      this.#logger.error(`${msg} - Failed`);
      throw new NotFoundException(`Failed to find integration '${integrationId}'`);
    }

    this.#logger.log(`${msg} - Complete`);
    return this.integrationMapper.toIntegration(entity);
  }

  /**
   * Fetches all integrations
   * @param dto The list dto
   */
  async list(dto: ListIntegrationsDto): Promise<PaginatedResDto<Integration>> {
    // Fetch paginated resources
    const entities = await paginate(
      this.integrationRepo,
      { limit: dto.limit, page: dto.page },
      {
        where: {
          ...(dto.name ? { name: In(dto.name) } : {}),
          ...(dto.type ? { type: In(dto.type) } : {}),
          ...(!isNil(dto.enabled) ? { isEnabled: dto.enabled } : {}),
        },
        order: { createdAt: dto.sortDir },
      },
    );

    return {
      data: entities.items.map(this.integrationMapper.toIntegration),
      page: entities.meta.currentPage,
      limit: entities.meta.itemsPerPage,
      total: entities.meta.totalItems,
    };
  }

  /**
   * Creates a new integration
   * @param dto The integration dto
   * @param req The authenticated request
   */
  async create(dto: CreateIntegrationDto, req?: AuthenticatedReq): Promise<Integration> {
    // Determine the integration type
    const type = this.#determineType(dto.name);

    const msg = `Attempting to create integration of type '${type}'`;

    // Determine the priority to set
    let priority = dto.priority;
    if (!priority) {
      const latest = await this.integrationRepo.findOne({ where: { type }, order: { priority: 'DESC' } });
      priority = latest ? latest.priority + 1 : 0;
    }

    // Create and persist the entity
    const entity = await this.integrationRepo.save({
      name: dto.name,
      type: type,
      isEnabled: dto.isEnabled,
      settings: dto.settings,
      priority: priority,
      allowedCountries: dto.allowedCountries ?? undefined,
      excludedCountries: dto.excludedCountries ?? undefined,
    });

    if (!entity) {
      this.#logger.error(`${msg} - Failed`);
      throw new InternalServerErrorException(`Failed to create '${type}' integration`);
    }

    // Build the domain model
    const domainIntegration = this.integrationMapper.toIntegration(entity);

    // Trigger the creation event
    this.kafka.emit(
      IntegrationCreatedEvent.type,
      new IntegrationCreatedEvent(
        {
          integration: domainIntegration,
          createdAt: DateTime.fromJSDate(domainIntegration.createdAt).toMillis(),
        },
        req,
      ),
    );

    this.#logger.log(`${msg} - Complete`);
    return domainIntegration;
  }

  /**
   * Updates an integration by its ID.
   * @param integrationId The id of the integration to update
   * @param dto The update dto
   * @param req The authenticated request
   */
  async update(integrationId: string, dto: UpdateIntegrationDto, req?: AuthenticatedReq): Promise<Integration> {
    const msg = `Updating integration '${integrationId}'`;

    // Update the entity by its id
    const result = await this.integrationRepo.update(
      { id: integrationId },
      {
        ...(dto.name ? { name: dto.name } : {}),
        ...(dto.name ? { type: this.#determineType(dto.name) } : {}),
        ...(!isNil(dto.isEnabled) ? { isEnabled: dto.isEnabled } : {}),
        ...(dto.settings ? { settings: dto.settings as any } : {}),
        ...(dto.priority ? { priority: dto.priority } : {}),
        ...(undefined !== dto.allowedCountries ? { allowedCountries: dto.allowedCountries } : {}),
        ...(undefined !== dto.excludedCountries ? { excludedCountries: dto.excludedCountries } : {}),
      },
    );

    if (result.affected === 0) {
      this.#logger.error(`${msg} - Failed`);
      throw new UnprocessableEntityException(`Failed to update integration '${integrationId}'`);
    }

    // Build the domain model
    const domainIntegration = await this.get(integrationId);

    // Trigger the update event
    this.kafka.emit(
      IntegrationUpdatedEvent.type,
      new IntegrationUpdatedEvent(
        {
          integration: domainIntegration,
          updatedAt: DateTime.fromJSDate(domainIntegration.updatedAt).toMillis(),
        },
        req,
      ),
    );

    this.#logger.log(`${msg} - Complete`);
    return domainIntegration;
  }

  /**
   * Deletes an existing integration.
   * @param integrationId The id of the integration to delete
   * @param req The authenticated request
   */
  async delete(integrationId: string, req?: AuthenticatedReq): Promise<boolean> {
    const msg = `Deleting integration '${integrationId}'`;
    this.#logger.log(`${msg} - Start`);

    // Find the entity
    const entity = await this.integrationRepo.findOne({ where: { id: integrationId } });
    if (!entity) {
      this.#logger.warn(`${msg}. Integration not found - Failed`);
      throw new NotFoundException('Integration not found');
    }

    // Delete the entity
    const res = await this.integrationRepo.delete({ id: entity.id });
    if (!res.affected || res.affected === 0) {
      this.#logger.error(`${msg} - Failed`);
      return false;
    }

    // Trigger the deletion event
    this.kafka.emit(
      IntegrationDeletedEvent.type,
      new IntegrationDeletedEvent({ integrationId, deletedAt: DateTime.utc().toMillis() }, req),
    );

    return true;
  }

  /**
   * Determines the type of integration by the integration name
   * @param name The integration name
   * @throws UnknownIntegrationNameException If the integration name is unknown and the type cannot be determined
   */
  #determineType(name: IntegrationName): IntegrationType {
    switch (name) {
      case IntegrationName.BRIDGER_PAY:
      case IntegrationName.CRYPTOCHILL:
      case IntegrationName.HELIOS:
        return IntegrationType.PAYMENT;

      case IntegrationName.MT5:
      case IntegrationName.YOUR_BOURSE:
      case IntegrationName.TRADE_LOCKER:
      case IntegrationName.DX_TRADER:
      case IntegrationName.CTRADER:
        return IntegrationType.TRADING_PLATFORM;

      case IntegrationName.SUMSUB:
      case IntegrationName.ONFIDO:
        return IntegrationType.KYC;

      case IntegrationName.SENDX:
        return IntegrationType.MARKETING;
      default:
        throw new UnknownIntegrationNameException(name);
    }
  }
}
