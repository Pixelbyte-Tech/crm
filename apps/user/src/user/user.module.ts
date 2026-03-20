import { TypeOrmModule } from '@nestjs/typeorm';
import { Module, forwardRef } from '@nestjs/common';

import { UserEntity, CompanyEntity, CompanySettingEntity } from '@crm/database';

import { AuthModule } from '../auth/auth.module';
import { UserController } from './user.controller';
import { UserMapper, CompanySettingMapper } from './mappers';
import { UserService, CompanySettingService } from './services';
import { UserSessionModule } from './modules/session/user-session.module';
import { InvitationModule } from './modules/invitation/invitation.module';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    InvitationModule,
    UserSessionModule,
    TypeOrmModule.forFeature([CompanyEntity, CompanySettingEntity, UserEntity]),
  ],
  providers: [CompanySettingMapper, CompanySettingService, UserMapper, UserService],
  controllers: [UserController],
  exports: [InvitationModule, UserSessionModule, UserMapper, UserService],
})
export class UserModule {}
