import { ApiTags, ApiExtraModels } from '@nestjs/swagger';
import { Get, Req, Post, Param, Query, Patch, Delete, Controller } from '@nestjs/common';

import { OpenApi } from '@crm/swagger';
import { PaginatedResDto } from '@crm/http';
import { UserNoteEntity } from '@crm/database';
import { Auth, Action, AuthenticatedReq } from '@crm/auth';
import { UserIdValidator, UserNoteIdValidator } from '@crm/validation';

import { Note } from './domain';
import { NoteService } from './services';
import { ListNotesDto, CreateNoteDto, UpdateNoteDto } from './dto';

@ApiTags('User Notes')
@ApiExtraModels(CreateNoteDto, ListNotesDto, UpdateNoteDto)
@Controller({ path: 'users', version: '1' })
export class NoteController {
  constructor(private readonly service: NoteService) {}

  /**
   * Fetch a single note by id
   * @param userId The user id to whom the note belongs
   * @param noteId The note id to fetch
   */
  @Auth(Action.READ, UserNoteEntity, { in: 'params', use: 'userId', findBy: 'userId' })
  @OpenApi({ type: Note })
  @Get(':userId/notes/:noteId')
  public async list(
    @Param('userId', UserIdValidator) userId: string,
    @Param('noteId', UserNoteIdValidator) noteId: string,
  ): Promise<{ data: Note }> {
    return { data: await this.service.get(noteId, userId) };
  }

  /**
   * Fetches all user notes belonging to a user
   * @param userId The user id to fetch
   * @param dto The payload dto
   */
  @Auth(Action.READ, UserNoteEntity, { in: 'params', use: 'userId', findBy: 'userId' })
  @OpenApi({ type: Note, isPaginated: true })
  @Get(':userId/notes')
  public async get(
    @Param('userId', UserIdValidator) userId: string,
    @Query() dto: ListNotesDto,
  ): Promise<PaginatedResDto<Note>> {
    return await this.service.list(userId, dto);
  }

  /**
   * Create a new note for a user
   * @param userId The user id to create the note for
   * @param dto The payload dto
   * @param req The authenticated request
   */
  @Auth(Action.CREATE, UserNoteEntity, { in: 'params', use: 'userId', findBy: 'userId' })
  @OpenApi({ type: Note })
  @Post(':userId/notes')
  public async create(
    @Param('userId', UserIdValidator) userId: string,
    @Query() dto: CreateNoteDto,
    @Req() req: AuthenticatedReq,
  ): Promise<{ data: Note }> {
    return { data: await this.service.create(req.user.userId, userId, dto) };
  }

  /**
   * Updates an existing note
   * @param userId The user id the note belongs to
   * @param noteId The id of the note to update
   * @param dto The payload dto
   */
  @Auth(Action.UPDATE, UserNoteEntity, { in: 'params', use: 'userId', findBy: 'userId' })
  @OpenApi({ type: Note })
  @Patch(':userId/notes/:noteId')
  public async update(
    @Param('userId', UserIdValidator) userId: string,
    @Param('noteId', UserNoteIdValidator) noteId: string,
    @Query() dto: UpdateNoteDto,
  ): Promise<{ data: Note }> {
    return { data: await this.service.update(noteId, userId, dto) };
  }

  /**
   * Deletes an existing note
   * @param userId The user id the note belongs to
   * @param noteId The id of the note to delete
   */
  @Auth(Action.UPDATE, UserNoteEntity, { in: 'params', use: 'userId', findBy: 'userId' })
  @OpenApi()
  @Delete(':userId/notes/:noteId')
  public async delete(
    @Param('userId', UserIdValidator) userId: string,
    @Param('noteId', UserNoteIdValidator) noteId: string,
  ): Promise<void> {
    await this.service.delete(noteId, userId);
  }
}
