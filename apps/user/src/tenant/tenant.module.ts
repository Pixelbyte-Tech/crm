import { TypeOrmModule } from '@nestjs/typeorm';
import { Module, forwardRef } from '@nestjs/common';

import { TenantEntity } from '@crm/database';

import { TenantMapper } from './mappers';
import { TenantService } from './services';
import { AuthModule } from '../auth/auth.module';
import { TenantController } from './tenant.controller';
import { TenantSessionModule } from './modules/session/tenant-session.module';

@Module({
  imports: [forwardRef(() => AuthModule), TenantSessionModule, TypeOrmModule.forFeature([TenantEntity])],
  providers: [TenantMapper, TenantService],
  controllers: [TenantController],
  exports: [TenantSessionModule, TenantMapper, TenantService],
})
export class TenantModule {}
