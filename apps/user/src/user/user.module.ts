import { TypeOrmModule } from '@nestjs/typeorm';
import { Module, forwardRef } from '@nestjs/common';

import { UserEntity, UserDetailEntity, UserSettingEntity, GlobalSettingEntity } from '@crm/database';

import { AuthModule } from '../auth/auth.module';
import { UserController } from './user.controller';
import { UserMapper, GlobalSettingMapper } from './mappers';
import { UserService, GlobalSettingService } from './services';
import { UserSessionModule } from './modules/session/user-session.module';
import { InvitationModule } from './modules/invitation/invitation.module';
import { NotificationModule } from './modules/notification/notification.module';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    InvitationModule,
    NotificationModule,
    UserSessionModule,
    TypeOrmModule.forFeature([GlobalSettingEntity, UserEntity, UserDetailEntity, UserSettingEntity]),
  ],
  providers: [GlobalSettingMapper, GlobalSettingService, UserMapper, UserService],
  controllers: [UserController],
  exports: [InvitationModule, UserSessionModule, UserMapper, UserService],
})
export class UserModule {}
