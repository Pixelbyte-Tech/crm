import { TypeOrmModule } from '@nestjs/typeorm';
import { Module, forwardRef } from '@nestjs/common';

import { UserEntity, UserDetailEntity, UserSettingEntity, GlobalSettingEntity } from '@crm/database';

import { AuthModule } from '../auth/auth.module';
import { UserController } from './user.controller';
import { UserMapper, GlobalSettingMapper } from './mappers';
import { UserService, GlobalSettingService } from './services';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    NotificationModule,
    TypeOrmModule.forFeature([GlobalSettingEntity, UserEntity, UserDetailEntity, UserSettingEntity]),
  ],
  providers: [GlobalSettingMapper, GlobalSettingService, UserMapper, UserService],
  controllers: [UserController],
  exports: [UserMapper, UserService],
})
export class UserModule {}
