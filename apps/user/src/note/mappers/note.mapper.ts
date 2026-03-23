import { Injectable } from '@nestjs/common';

import { UserNoteEntity } from '@crm/database';

import { Note } from '../domain';

@Injectable()
export class NoteMapper {
  toNote(data: UserNoteEntity): Note {
    const model = new Note();
    model.id = data.id;

    model.summary = data.summary ?? undefined;
    model.body = data.body;
    model.isPinned = data.isPinned;
    model.authorId = data.authorId;
    model.userId = data.userId;
    model.createdAt = data.createdAt;
    model.updatedAt = data.updatedAt;
    return model;
  }
}
