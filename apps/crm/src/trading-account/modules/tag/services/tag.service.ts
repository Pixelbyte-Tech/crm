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

import { TagEntity } from '@crm/database';
import { PaginatedResDto } from '@crm/http';
import { AuthenticatedReq } from '@crm/auth';
import { TagCreatedEvent, TagUpdatedEvent, TagDeletedEvent } from '@crm/kafka';

import { Tag } from '../domain';
import { TagMapper } from '../mappers';
import { ListTagsDto, UpdateTagDto, CreateTagDto } from '../dto';

@Injectable()
export class TagService {
  constructor(
    private readonly tagMapper: TagMapper,
    @Inject('KAFKA') private readonly kafka: ClientKafka,
    @InjectRepository(TagEntity)
    private readonly tagRepo: Repository<TagEntity>,
  ) {}

  readonly #logger: Logger = new Logger(this.constructor.name);

  /**
   * Fetches a tag by its id
   * @param tagId The id of the ptag to fetch
   */
  async get(tagId: string): Promise<Tag> {
    const msg = `Fetching tag '${tagId}'`;

    // Find the entity
    const entity = await this.tagRepo.findOne({ where: { id: tagId } });
    if (!entity) {
      this.#logger.error(`${msg} - Failed`);
      throw new NotFoundException(`Failed to find tag '${tagId}'`);
    }

    this.#logger.log(`${msg} - Complete`);
    return this.tagMapper.toTag(entity);
  }

  /**
   * Fetches all tags
   * @param dto The list dto
   */
  async list(dto: ListTagsDto): Promise<PaginatedResDto<Tag>> {
    // Fetch paginated resources
    const entities = await paginate(
      this.tagRepo,
      { limit: dto.limit, page: dto.page },
      { order: { createdAt: dto.sortDir } },
    );

    return {
      data: entities.items.map(this.tagMapper.toTag),
      page: entities.meta.currentPage,
      limit: entities.meta.itemsPerPage,
      total: entities.meta.totalItems,
    };
  }

  /**
   * Creates a new tag
   * @param dto The tag dto
   * @param req The authenticated request
   */
  async create(dto: CreateTagDto, req?: AuthenticatedReq): Promise<Tag> {
    const msg = `Attempting to create tag`;

    // Create and persist the entity
    const entity = await this.tagRepo.save({ name: dto.name });
    if (!entity) {
      this.#logger.error(`${msg} - Failed`);
      throw new InternalServerErrorException(`Failed to create tag`);
    }

    // Build the domain tag
    const domainTag = this.tagMapper.toTag(entity);

    // Trigger the creation event
    this.kafka.emit(
      TagCreatedEvent.type,
      new TagCreatedEvent(
        {
          tagId: domainTag.id,
          name: domainTag.name,
          createdAt: DateTime.fromJSDate(domainTag.createdAt).toMillis(),
        },
        req,
      ),
    );

    this.#logger.log(`${msg} - Complete`);
    return domainTag;
  }

  /**
   * Updates a tag by its ID.
   * @param tagId The id of the tag to update
   * @param dto The update dto
   * @param req The authenticated request
   */
  async update(tagId: string, dto: UpdateTagDto, req?: AuthenticatedReq): Promise<Tag> {
    const msg = `Updating tag '${tagId}'`;

    // Update the entity by its id
    const result = await this.tagRepo.update({ id: tagId }, { ...(dto.name ? { name: dto.name } : {}) });

    if (result.affected === 0) {
      this.#logger.error(`${msg} - Failed`);
      throw new UnprocessableEntityException(`Failed to update tag '${tagId}'`);
    }

    // Build the domain tag
    const domainTag = await this.get(tagId);

    // Trigger the update event
    this.kafka.emit(
      TagUpdatedEvent.type,
      new TagUpdatedEvent(
        {
          tagId: domainTag.id,
          name: domainTag.name,
          updatedAt: DateTime.fromJSDate(domainTag.updatedAt).toMillis(),
        },
        req,
      ),
    );

    this.#logger.log(`${msg} - Complete`);
    return domainTag;
  }

  /**
   * Deletes an existing tag
   * @param tagId The id of the tag to delete
   * @param req The authenticated request
   */
  async delete(tagId: string, req?: AuthenticatedReq): Promise<boolean> {
    const msg = `Deleting tag '${tagId}'`;
    this.#logger.log(`${msg} - Start`);

    // Find the entity
    const entity = await this.tagRepo.findOne({ where: { id: tagId } });
    if (!entity) {
      this.#logger.warn(`${msg}. Tag not found - Failed`);
      throw new NotFoundException('Tag not found');
    }

    // Delete the entity
    const res = await this.tagRepo.delete({ id: entity.id });
    if (!res.affected || res.affected === 0) {
      this.#logger.error(`${msg} - Failed`);
      return false;
    }

    // Trigger the deletion event
    this.kafka.emit(TagDeletedEvent.type, new TagDeletedEvent({ tagId, deletedAt: DateTime.utc().toMillis() }, req));

    return true;
  }
}
