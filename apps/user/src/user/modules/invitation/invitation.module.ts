import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserEntity, CompanyEntity, UserCompanyEntity, CompanyInvitationEntity } from '@crm/database';

import { InvitationMapper } from './mappers';
import { ExpireInvitationsProcessor } from './processors';
import { JobsService, InvitationService } from './services';
import { InvitationController } from './invitation.controller';
import { AppConfig } from '../../../config/app/app-config.type';

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
      name: 'invitations-queue',
      inject: [ConfigService],
      useFactory: (c: ConfigService<{ app: AppConfig }>) => {
        const host = c.getOrThrow('app.redisHost', { infer: true });
        const port = c.getOrThrow('app.redisPort', { infer: true });

        return { redis: `redis://${host}:${port}`, defaultJobOptions: { removeOnComplete: true, removeOnFail: 10 } };
      },
    }),
    TypeOrmModule.forFeature([CompanyEntity, CompanyInvitationEntity, UserCompanyEntity, UserEntity]),
  ],
  providers: [ExpireInvitationsProcessor, InvitationMapper, InvitationService, JobsService],
  controllers: [InvitationController],
  exports: [InvitationService],
})
export class InvitationModule {}
