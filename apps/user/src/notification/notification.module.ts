import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserEntity, UserNotificationEntity } from '@crm/database';

import { NotificationService } from './services';
import { AuthModule } from '../auth/auth.module';
import { NotificationController } from './notification.controller';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([UserEntity, UserNotificationEntity])],
  providers: [NotificationService],
  controllers: [NotificationController],
  exports: [NotificationService],
})
export class NotificationModule {}
