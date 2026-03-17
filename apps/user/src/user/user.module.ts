import { TypeOrmModule } from '@nestjs/typeorm';
import { Module, forwardRef } from '@nestjs/common';

import { UserEntity, CompanyEntity } from '@crm/database';

import { UserMapper } from './mappers';
import { UserService } from './services';
import { AuthModule } from '../auth/auth.module';
import { UserController } from './user.controller';
import { TenantModule } from '../tenant/tenant.module';
import { UserSessionModule } from './modules/session/user-session.module';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    UserSessionModule,
    TenantModule,
    TypeOrmModule.forFeature([CompanyEntity, UserEntity]),
  ],
  providers: [UserMapper, UserService],
  controllers: [UserController],
  exports: [UserSessionModule, TenantModule, UserMapper, UserService],
})
export class UserModule {}
