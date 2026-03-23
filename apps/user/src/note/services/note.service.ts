import { isNil } from 'lodash';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate } from 'nestjs-typeorm-paginate';
import {
  Logger,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  UnprocessableEntityException,
} from '@nestjs/common';

import { PaginatedResDto } from '@crm/http';
import { UserNoteEntity } from '@crm/database';

import { Note } from '../domain';
import { NoteMapper } from '../mappers';
import { ListNotesDto, CreateNoteDto, UpdateNoteDto } from '../dto';

@Injectable()
export class NoteService {
  constructor(
    private readonly noteMapper: NoteMapper,
    @InjectRepository(UserNoteEntity)
    private readonly noteRepo: Repository<UserNoteEntity>,
  ) {}

  readonly #logger: Logger = new Logger(this.constructor.name);

  /**
   * Fetches a note by its id
   * @param noteId The id of the note to fetch
   * @param userId The id of the user the note belongs to
   */
  async get(noteId: string, userId: string): Promise<Note> {
    const msg = `Fetching user note '${noteId}'`;

    // Find the entity
    const note = await this.noteRepo.findOne({ where: { id: noteId, userId } });
    if (!note) {
      this.#logger.error(`${msg} - Failed`);
      throw new NotFoundException(`Failed to find user note '${noteId}'`);
    }

    this.#logger.log(`${msg} - Complete`);
    return this.noteMapper.toNote(note);
  }

  /**
   * Fetches all notes belonging to a user
   * @param userId The id of the user to fetch
   * @param dto The list dto
   */
  async list(userId: string, dto: ListNotesDto): Promise<PaginatedResDto<Note>> {
    // Fetch paginated resources
    const entities = await paginate(
      this.noteRepo,
      { limit: dto.limit, page: dto.page },
      {
        where: {
          userId,
          ...(dto.authorId ? { authorId: dto.authorId } : {}),
          ...(!isNil(dto.pinned) ? { isPinned: dto.pinned } : {}),
        },
        order: { createdAt: dto.sortDir },
      },
    );

    return {
      data: entities.items.map(this.noteMapper.toNote),
      page: entities.meta.currentPage,
      limit: entities.meta.itemsPerPage,
      total: entities.meta.totalItems,
    };
  }

  /**
   * Creates a new note for a user
   * @param authorId The id of the note author
   * @param userId The id of the user the note belongs to
   * @param dto The note dto
   */
  async create(authorId: string, userId: string, dto: CreateNoteDto): Promise<Note> {
    const msg = `Attempting to create note for user '${userId}'`;

    // Create and persist the entity
    const entity = await this.noteRepo.save({
      summary: dto.summary,
      body: dto.body,
      isPinned: dto.isPinned,
      authorId,
      userId,
    });

    if (!entity) {
      this.#logger.error(`${msg} - Failed`);
      throw new InternalServerErrorException(`Failed to create note for user '${userId}'`);
    }

    this.#logger.log(`${msg} - Complete`);
    return this.noteMapper.toNote(entity);
  }

  /**
   * Updates a user note by its ID.
   * @param noteId The id of the note to update
   * @param userId The id of the user the note belongs to
   * @param dto The update dto
   */
  async update(noteId: string, userId: string, dto: UpdateNoteDto): Promise<Note> {
    const msg = `Updating user note '${noteId}'`;

    // Update the entity by its id
    const result = await this.noteRepo.update(
      { id: noteId },
      {
        ...(undefined !== dto.summary ? { summary: dto.summary } : {}),
        ...(dto.body ? { body: dto.body } : {}),
        ...(!isNil(dto.isPinned) ? { isPinned: dto.isPinned } : {}),
      },
    );

    if (result.affected === 0) {
      this.#logger.error(`${msg} - Failed`);
      throw new UnprocessableEntityException(`Failed to update user note '${noteId}'`);
    }

    this.#logger.log(`${msg} - Complete`);
    return this.get(noteId, userId);
  }

  /**
   * Deletes an existing user note.
   * @param noteId The id of the note to delete
   * @param userId The id of the user to whom the note belongs
   */
  async delete(noteId: string, userId: string): Promise<boolean> {
    const msg = `Deleting user note '${noteId}'`;
    this.#logger.log(`${msg} - Start`);

    // Find the entity
    const entity = await this.noteRepo.findOne({ where: { id: noteId, userId } });
    if (!entity) {
      this.#logger.warn(`${msg}. User note not found - Failed`);
      throw new NotFoundException('User note not found');
    }

    // Delete the invitation
    const res = await this.noteRepo.delete({ id: entity.id });
    if (!res.affected || res.affected === 0) {
      this.#logger.error(`${msg} - Failed`);
      return false;
    }

    return true;
  }
}
