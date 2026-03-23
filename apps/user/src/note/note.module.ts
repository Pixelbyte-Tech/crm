import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserNoteEntity } from '@crm/database';

import { NoteMapper } from './mappers';
import { NoteService } from './services';
import { NoteController } from './note.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserNoteEntity])],
  providers: [NoteMapper, NoteService],
  controllers: [NoteController],
})
export class NoteModule {}
