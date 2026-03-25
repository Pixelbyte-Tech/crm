import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserEntity, UserNotificationEntity } from '@crm/database';

import { NotificationService } from './services';
import { AuthModule } from '../auth/auth.module';
import { KafkaController } from './kafka.controller';
import { NotificationController } from './notification.controller';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([UserEntity, UserNotificationEntity])],
  providers: [NotificationService],
  controllers: [KafkaController, NotificationController],
  exports: [NotificationService],
})
export class NotificationModule {}
