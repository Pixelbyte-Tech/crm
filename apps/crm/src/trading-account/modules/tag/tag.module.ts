import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TagEntity } from '@crm/database';

import { TagMapper } from './mappers';
import { TagService } from './services';
import { TagController } from './tag.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TagEntity])],
  providers: [TagMapper, TagService],
  controllers: [TagController],
})
export class TagModule {}
