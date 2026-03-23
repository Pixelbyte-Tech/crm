import * as path from 'path';

import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { I18nModule, QueryResolver } from 'nestjs-i18n';

import { InvitationEntity, GlobalSettingEntity, UserNotificationEntity } from '@crm/database';

import { TransportFactory } from './factories';
import { JobsService, MailService } from './services';
import { AppConfig } from '../config/app/app-config.type';
import { SesTransport, SmtpTransport } from './transports';
import { SendMailProcessor, SendInvitationsProcessor } from './processors';

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
      name: 'notification-queue',
      inject: [ConfigService],
      useFactory: (c: ConfigService<{ app: AppConfig }>) => {
        const host = c.getOrThrow('app.redisHost', { infer: true });
        const port = c.getOrThrow('app.redisPort', { infer: true });

        return { redis: `redis://${host}:${port}`, defaultJobOptions: { removeOnComplete: true, removeOnFail: 10 } };
      },
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: { path: path.join(__dirname, '/i18n/'), watch: true },
      resolvers: [{ use: QueryResolver, options: ['lang'] }],
    }),
    TypeOrmModule.forFeature([GlobalSettingEntity, InvitationEntity, UserNotificationEntity]),
  ],
  providers: [
    JobsService,
    MailService,
    SendInvitationsProcessor,
    SendMailProcessor,
    SesTransport,
    SmtpTransport,
    TransportFactory,
  ],
  exports: [MailService],
})
export class MailModule {}
