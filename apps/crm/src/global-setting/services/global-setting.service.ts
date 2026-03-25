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

import { GlobalSetting } from '@crm/types';
import { PaginatedResDto } from '@crm/http';
import { AuthenticatedReq } from '@crm/auth';
import { GlobalSettingEntity } from '@crm/database';
import { GlobalSettingCreatedEvent, GlobalSettingUpdatedEvent, GlobalSettingDeletedEvent } from '@crm/kafka';

import { GlobalSettingMapper } from '../mappers';
import { ListGlobalSettingsDto, UpdateGlobalSettingDto, CreateGlobalSettingDto } from '../dto';

@Injectable()
export class GlobalSettingService {
  constructor(
    private readonly mapper: GlobalSettingMapper,
    @Inject('KAFKA') private readonly kafka: ClientKafka,
    @InjectRepository(GlobalSettingEntity)
    private readonly repo: Repository<GlobalSettingEntity>,
  ) {}

  readonly #logger: Logger = new Logger(this.constructor.name);

  /**
   * Fetches a setting by its id
   * @param settingId The id of the setting to fetch
   */
  async get(settingId: string): Promise<GlobalSetting> {
    const msg = `Fetching global setting '${settingId}'`;

    // Find the entity
    const entity = await this.repo.findOne({ where: { id: settingId } });
    if (!entity) {
      this.#logger.error(`${msg} - Failed`);
      throw new NotFoundException(`Failed to find global setting '${settingId}'`);
    }

    this.#logger.log(`${msg} - Complete`);
    return this.mapper.toSetting(entity);
  }

  /**
   * Fetches all global settings
   * @param dto The list dto
   */
  async list(dto: ListGlobalSettingsDto): Promise<PaginatedResDto<GlobalSetting>> {
    // Fetch paginated resources
    const entities = await paginate(
      this.repo,
      { limit: dto.limit, page: dto.page },
      { order: { createdAt: dto.sortDir } },
    );

    return {
      data: entities.items.map(this.mapper.toSetting),
      page: entities.meta.currentPage,
      limit: entities.meta.itemsPerPage,
      total: entities.meta.totalItems,
    };
  }

  /**
   * Creates a new global setting
   * @param dto The global setting dto
   * @param req The authenticated request
   */
  async create(dto: CreateGlobalSettingDto, req?: AuthenticatedReq): Promise<GlobalSetting> {
    const msg = `Attempting to create global setting`;

    // Create and persist the entity
    const entity = await this.repo.save({ key: dto.key, value: dto.value });
    if (!entity) {
      this.#logger.error(`${msg} - Failed`);
      throw new InternalServerErrorException(`Failed to create global setting`);
    }

    // Build the domain global setting
    const domainSetting = this.mapper.toSetting(entity);

    // Trigger the creation event
    this.kafka.emit(
      GlobalSettingCreatedEvent.type,
      new GlobalSettingCreatedEvent(
        { setting: domainSetting, createdAt: DateTime.fromJSDate(domainSetting.createdAt).toMillis() },
        req,
      ),
    );

    this.#logger.log(`${msg} - Complete`);
    return domainSetting;
  }

  /**
   * Updates a global setting by its ID.
   * @param settingId The id of the global setting to update
   * @param dto The update dto
   * @param req The authenticated request
   */
  async update(settingId: string, dto: UpdateGlobalSettingDto, req?: AuthenticatedReq): Promise<GlobalSetting> {
    const msg = `Updating global setting '${settingId}'`;

    // Update the entity by its id
    const result = await this.repo.update({ id: settingId }, { value: dto.value });
    if (result.affected === 0) {
      this.#logger.error(`${msg} - Failed`);
      throw new UnprocessableEntityException(`Failed to update global setting '${settingId}'`);
    }

    // Build the domain global setting
    const domainSetting = await this.get(settingId);

    // Trigger the update event
    this.kafka.emit(
      GlobalSettingUpdatedEvent.type,
      new GlobalSettingUpdatedEvent(
        { setting: domainSetting, updatedAt: DateTime.fromJSDate(domainSetting.updatedAt).toMillis() },
        req,
      ),
    );

    this.#logger.log(`${msg} - Complete`);
    return domainSetting;
  }

  /**
   * Deletes an existing global setting
   * @param settingId The id of the global setting to delete
   * @param req The authenticated request
   */
  async delete(settingId: string, req?: AuthenticatedReq): Promise<boolean> {
    const msg = `Deleting global setting '${settingId}'`;
    this.#logger.log(`${msg} - Start`);

    // Find the entity
    const entity = await this.repo.findOne({ where: { id: settingId } });
    if (!entity) {
      this.#logger.warn(`${msg}. Global setting not found - Failed`);
      throw new NotFoundException('Global setting not found');
    }

    // Delete the entity
    const res = await this.repo.delete({ id: entity.id });
    if (!res.affected || res.affected === 0) {
      this.#logger.error(`${msg} - Failed`);
      return false;
    }

    // Trigger the deletion event
    this.kafka.emit(
      GlobalSettingDeletedEvent.type,
      new GlobalSettingDeletedEvent({ settingId, deletedAt: DateTime.utc().toMillis() }, req),
    );

    return true;
  }
}
