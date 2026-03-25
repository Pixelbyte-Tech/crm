import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuditLogEntity } from '@crm/database';

import { AuditService } from './services';
import { UserController, UserNoteController } from './controllers';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLogEntity])],
  providers: [AuditService],
  controllers: [UserController, UserNoteController],
})
export class AuditModule {}
