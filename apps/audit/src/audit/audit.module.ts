import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuditLogEntity } from '@crm/database';

import { AuditService } from './services';
import {
  TagController,
  UserController,
  ServerController,
  UserNoteController,
  IntegrationController,
  PlatformClientController,
} from './controllers';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLogEntity])],
  providers: [AuditService],
  controllers: [
    IntegrationController,
    PlatformClientController,
    ServerController,
    TagController,
    UserController,
    UserNoteController,
  ],
})
export class AuditModule {}
