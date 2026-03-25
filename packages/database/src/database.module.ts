import { TypeOrmModule } from '@nestjs/typeorm';
import { InjectionToken } from '@nestjs/common/interfaces/modules/injection-token.interface';
import { Type, Global, Module, Provider, DynamicModule, ModuleMetadata } from '@nestjs/common';
import { OptionalFactoryDependency } from '@nestjs/common/interfaces/modules/optional-factory-dependency.interface';

import { TagEntity } from './entities/tag.entity';
import { UserEntity } from './entities/user.entity';
import { AlertEntity } from './entities/alert.entity';
import { ServerEntity } from './entities/server.entity';
import { WalletEntity } from './entities/wallet.entity';
import { RewardEntity } from './entities/reward.entity';
import { ChannelEntity } from './entities/channel.entity';
import { LoyaltyEntity } from './entities/loyalty.entity';
import { AuditLogEntity } from './entities/audit-log.entity';
import { UserNoteEntity } from './entities/user-note.entity';
import { WheelSpinEntity } from './entities/wheel-spin.entity';
import { InvitationEntity } from './entities/invitation.entity';
import { UserAvatarEntity } from './entities/user-avatar.entity';
import { UserDetailEntity } from './entities/user-detail.entity';
import { UserRewardEntity } from './entities/user-reward.entity';
import { MysteryBoxEntity } from './entities/mystery-box.entity';
import { IntegrationEntity } from './entities/integration.entity';
import { UserSettingEntity } from './entities/user-setting.entity';
import { ExchangeRateEntity } from './entities/exchange-rate.entity';
import { TradingEventEntity } from './entities/trading-event.entity';
import { UserDocumentEntity } from './entities/user-document.entity';
import { GlobalSettingEntity } from './entities/global-setting.entity';
import { PlatformClientEntity } from './entities/platform-client.entity';
import { TradingAccountEntity } from './entities/trading-account.entity';
import { LoyaltyHistoryEntity } from './entities/loyalty-history.entity';
import { UserMysteryBoxEntity } from './entities/user-mystery-box.entity';
import { UserAuthSessionEntity } from './entities/user-auth-session.entity';
import { UserNotificationEntity } from './entities/user-notification.entity';
import { PaymentPromoCodeEntity } from './entities/payment-promo-code.entity';
import { WalletTransactionEntity } from './entities/wallet-transaction.entity';
import { TradingAccountTagEntity } from './entities/trading-account-tag.entity';
import { PaymentTransactionEntity } from './entities/payment-transaction.entity';
import { TradingAccountNoteEntity } from './entities/trading-account-note.entity';
import { TradingAccountTypeEntity } from './entities/trading-account-type.entity';
import { UserInAppNotificationEntity } from './entities/user-in-app-notification.entity';
import { WalletTransactionHistoryEntity } from './entities/wallet-transaction-history.entity';
import { TradingAccountTypeLeverageEntity } from './entities/trading-account-type-leverage.entity';

export interface DatabaseModuleOptions {
  host: string;
  port: number;
  name: string;
  username: string;
  password: string;
  poolSize?: number;
  maxUses?: number;
  rejectUnauthorized?: boolean;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
  sslEnabled?: boolean;
  ca?: string;
  key?: string;
  cert?: string;
}

interface DatabaseOptionsFactory {
  createSearchOptions(): Promise<DatabaseModuleOptions> | DatabaseModuleOptions;
}

interface DatabaseModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  inject?: Array<InjectionToken | OptionalFactoryDependency>;
  useClass?: Type<DatabaseOptionsFactory>;
  useExisting?: Type<DatabaseOptionsFactory>;
  useFactory?: (...args: unknown[]) => Promise<DatabaseModuleOptions> | DatabaseModuleOptions;
}

@Global()
@Module({})
export class DatabaseModule {
  public static forRootAsync(options: DatabaseModuleAsyncOptions): DynamicModule {
    const providers: Provider[] = this.createAsyncProviders(options);

    return {
      module: DatabaseModule,
      imports: [
        ...(options.imports ?? []),
        TypeOrmModule.forRootAsync({
          inject: ['DB_CONFIG_OPTIONS'],
          useFactory: (config: DatabaseModuleOptions) => ({
            type: 'postgres',
            host: config.host,
            port: config.port,
            username: config.username,
            password: config.password,
            database: config.name,
            dropSchema: false,
            keepConnectionAlive: true,
            logging: false,
            logger: 'advanced-console',
            entities: [__dirname + '/entities/**/*.entity{.ts,.js}'],
            migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
            migrationsTableName: 'each',
            poolSize: config.poolSize,
            extra: {
              max: config.poolSize, // based on https://node-postgres.com/apis/pool
              idleTimeoutMillis: config.idleTimeoutMillis || 30000, // how long a client is allowed to remain idle before being closed
              connectionTimeoutMillis: config.connectionTimeoutMillis || 2000, // how long to wait for a connection from the pool
              maxUses: config.maxUses || 7500, // max number of clients the pool should contain
              ssl: config.sslEnabled
                ? {
                    rejectUnauthorized: config.rejectUnauthorized,
                    ca: config.ca,
                    key: config.key,
                    cert: config.cert,
                  }
                : undefined,
            },
          }),
        }),
      ],
      providers: [
        ...providers,
        AlertEntity,
        AuditLogEntity,
        ChannelEntity,
        InvitationEntity,
        GlobalSettingEntity,
        ExchangeRateEntity,
        IntegrationEntity,
        LoyaltyEntity,
        LoyaltyHistoryEntity,
        MysteryBoxEntity,
        PaymentPromoCodeEntity,
        PaymentTransactionEntity,
        PlatformClientEntity,
        RewardEntity,
        ServerEntity,
        TagEntity,
        TradingAccountEntity,
        TradingAccountNoteEntity,
        TradingAccountTagEntity,
        TradingAccountTypeEntity,
        TradingAccountTypeLeverageEntity,
        TradingEventEntity,
        UserEntity,
        UserAuthSessionEntity,
        UserAvatarEntity,
        UserDetailEntity,
        UserDocumentEntity,
        UserMysteryBoxEntity,
        UserNoteEntity,
        UserNotificationEntity,
        UserRewardEntity,
        UserInAppNotificationEntity,
        UserSettingEntity,
        WalletEntity,
        WalletTransactionEntity,
        WalletTransactionHistoryEntity,
        WheelSpinEntity,
      ],
      exports: ['DB_CONFIG_OPTIONS'],
    };
  }

  private static createAsyncProviders(options: DatabaseModuleAsyncOptions): Provider[] {
    const providers: Provider[] = [this.createAsyncOptionsProvider(options)];

    if (options.useClass) {
      providers.push({ provide: options.useClass, useClass: options.useClass });
    }

    return providers;
  }

  private static createAsyncOptionsProvider(options: DatabaseModuleAsyncOptions): Provider {
    if (options.useFactory) {
      return {
        provide: 'DB_CONFIG_OPTIONS',
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    return {
      provide: 'DB_CONFIG_OPTIONS',
      useFactory: async (optionsFactory: DatabaseOptionsFactory) => {
        return optionsFactory.createSearchOptions();
      },
      inject: [options.useExisting! || options.useClass!],
    };
  }
}
