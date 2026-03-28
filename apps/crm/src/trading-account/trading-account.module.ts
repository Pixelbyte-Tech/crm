import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { UserEntity, ServerEntity, TradingAccountEntity } from '@crm/database';

import geoConfig from './config/geo/geo.config';

import { TagModule } from './modules/tag/tag.module';
import { DeleteAccountProcessor } from './processors';
import { AppConfig } from '../config/app/app-config.type';
import { SchemaModule } from './modules/schema/schema.module';
import { BullLogger, TradingAccountService } from './services';
import { TradingAccountController } from './trading-account.controller';
import { BalanceMapper, UserGroupMapper, TradingAccountMapper } from './mappers';

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
      name: 'trading-account-queue',
      inject: [ConfigService],
      useFactory: (c: ConfigService<{ app: AppConfig }>) => {
        const host = c.getOrThrow('app.redisHost', { infer: true });
        const port = c.getOrThrow('app.redisPort', { infer: true });

        return {
          redis: `redis://${host}:${port}`,
          defaultJobOptions: { removeOnComplete: true, removeOnFail: 10, backoff: { type: 'exponential' } },
        };
      },
    }),
    ConfigModule.forFeature(geoConfig),
    TagModule,
    SchemaModule,
    TypeOrmModule.forFeature([ServerEntity, TradingAccountEntity, UserEntity]),
  ],
  providers: [
    BalanceMapper,
    BullLogger,
    DeleteAccountProcessor,
    TradingAccountMapper,
    TradingAccountService,
    UserGroupMapper,
  ],
  controllers: [TradingAccountController],
})
export class TradingAccountModule {}
