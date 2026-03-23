import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { SwaggerModule } from '@crm/swagger';

import { HealthModule } from './health/health.module';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (c: ConfigService) => {
        const port = Number(c.getOrThrow('REDIS_PORT'));
        const host = c.getOrThrow('REDIS_HOST');
        return {
          redis: { host, port, keepAlive: 1, reconnectOnError: () => true },
        };
      },
    }),
    BullModule.registerQueue({ name: 'invitation-queue' }),
    BullModule.registerQueue({ name: 'notification-queue' }),
    BullBoardModule.forRootAsync({
      useFactory: () => ({
        adapter: ExpressAdapter,
        route: '/ui',
        boardOptions: {
          uiConfig: {
            boardTitle: 'Bull Queues',
          },
        },
      }),
    }),
    BullBoardModule.forFeature({
      name: 'invitation-queue',
      adapter: BullAdapter,
    }),
    BullBoardModule.forFeature({
      name: 'notification-queue',
      adapter: BullAdapter,
    }),
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env'] }),
    SwaggerModule,
    HealthModule,
  ],
})
export class AppModule {}
