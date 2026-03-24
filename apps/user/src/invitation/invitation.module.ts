import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserEntity, InvitationEntity } from '@crm/database';

import { InvitationMapper } from './mappers';
import { ExpireInvitationsProcessor } from './processors';
import { AppConfig } from '../config/app/app-config.type';
import { InvitationController } from './invitation.controller';
import { BullLogger, JobsService, InvitationService } from './services';

@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (c: ConfigService<{ app: AppConfig }>) => {
        const host = c.getOrThrow('app.redisHost', { infer: true });
        const port = c.getOrThrow('app.redisPort', { infer: true });

        return { redis: `redis://${host}:${port}` };
      },
    }),
    BullModule.registerQueueAsync({
      name: 'invitation-queue',
      inject: [ConfigService],
      useFactory: (c: ConfigService<{ app: AppConfig }>) => {
        const host = c.getOrThrow('app.redisHost', { infer: true });
        const port = c.getOrThrow('app.redisPort', { infer: true });

        return { redis: `redis://${host}:${port}`, defaultJobOptions: { removeOnComplete: true, removeOnFail: 10 } };
      },
    }),
    TypeOrmModule.forFeature([InvitationEntity, UserEntity]),
  ],
  providers: [BullLogger, ExpireInvitationsProcessor, InvitationMapper, InvitationService, JobsService],
  controllers: [InvitationController],
  exports: [InvitationService],
})
export class InvitationModule {}
