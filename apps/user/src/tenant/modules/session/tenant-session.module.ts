import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserAuthSessionEntity } from '@crm/database';

import { TenantSessionMapper } from './mappers';
import { TenantSessionService } from './services';
import { TenantSessionController } from './tenant-session.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserAuthSessionEntity])],
  providers: [TenantSessionMapper, TenantSessionService],
  controllers: [TenantSessionController],
  exports: [TenantSessionMapper, TenantSessionService],
})
export class TenantSessionModule {}
