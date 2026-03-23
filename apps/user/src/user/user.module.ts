import { TypeOrmModule } from '@nestjs/typeorm';
import { Module, forwardRef } from '@nestjs/common';

import { UserEntity, CompanyEntity, UserDetailEntity, UserSettingEntity, CompanySettingEntity } from '@crm/database';

import { AuthModule } from '../auth/auth.module';
import { UserController } from './user.controller';
import { UserMapper, CompanySettingMapper } from './mappers';
import { UserService, CompanySettingService } from './services';
import { UserSessionModule } from './modules/session/user-session.module';
import { InvitationModule } from './modules/invitation/invitation.module';
import { NotificationModule } from './modules/notification/notification.module';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    InvitationModule,
    NotificationModule,
    UserSessionModule,
    TypeOrmModule.forFeature([CompanyEntity, CompanySettingEntity, UserEntity, UserDetailEntity, UserSettingEntity]),
  ],
  providers: [CompanySettingMapper, CompanySettingService, UserMapper, UserService],
  controllers: [UserController],
  exports: [InvitationModule, UserSessionModule, UserMapper, UserService],
})
export class UserModule {}
