import { join } from 'path';

import Redis from 'ioredis';
import { CacheModule } from '@nestjs/cache-manager';
import { I18nModule, HeaderResolver, AcceptLanguageResolver } from 'nestjs-i18n';
import { InjectionToken } from '@nestjs/common/interfaces/modules/injection-token.interface';
import { Type, Module, Global, Provider, DynamicModule, ModuleMetadata } from '@nestjs/common';
import { OptionalFactoryDependency } from '@nestjs/common/interfaces/modules/optional-factory-dependency.interface';

import { Mt5ErrorMapper } from './mappers/error/mt5-error.mapper';
import { Mt5RequestMapper } from './mappers/request/mt5-request.mapper';
import { Mt5ResponseMapper } from './mappers/response/mt5-response.mapper';
import { BarMapper as Mt5BarMapper } from './mappers/response/mt5/bar.mapper';
import { DealMapper as Mt5DealMapper } from './mappers/response/mt5/deal.mapper';
import { OrderMapper as Mt5OrderMapper } from './mappers/response/mt5/order.mapper';
import { SymbolMapper as Mt5SymbolMapper } from './mappers/response/mt5/symbol.mapper';
import { JournalMapper as Mt5JournalMapper } from './mappers/response/mt5/journal.mapper';
import { AccountMapper as Mt5AccountMapper } from './mappers/response/mt5/account.mapper';
import { HolidayMapper as MT5HolidayMapper } from './mappers/response/mt5/holiday.mapper';
import { PositionMapper as Mt5PositionMapper } from './mappers/response/mt5/position.mapper';
import { GroupReqMapper as Mt5GroupReqMapper } from './mappers/request/mt5/group-req.mapper';
import { UserGroupMapper as Mt5UserGroupMapper } from './mappers/response/mt5/user-group.mapper';
import { CommandReqMapper as Mt5CommandReqMapper } from './mappers/request/mt5/command-req.mapper';
import { CommissionGroupMapper as Mt5CommissionGroupMapper } from './mappers/response/mt5/commission-group.mapper';
import { BalanceOperationReqMapper as Mt5BalanceOperationReqMapper } from './mappers/request/mt5/balance-operation-req.mapper';

import { TlErrorMapper } from './mappers/error/tl-error.mapper';
import { TlRequestMapper } from './mappers/request/tl-request.mapper';
import { TlResponseMapper } from './mappers/response/tl-response.mapper';
import { ReportMapper as TlReportMapper } from './mappers/response/tl/report.mapper';
import { SymbolMapper as TlSymbolMapper } from './mappers/response/tl/symbol.mapper';
import { AccountMapper as TlAccountMapper } from './mappers/response/tl/account.mapper';
import { PositionMapper as TlPositionMapper } from './mappers/response/tl/position.mapper';
import { RiskPlanMapper as TlRiskPlanMapper } from './mappers/response/tl/risk-plan.mapper';
import { UserGroupMapper as TlUserGroupMapper } from './mappers/response/tl/user-group.mapper';
import { AccountReqMapper as TlAccountReqMapper } from './mappers/request/tl/account-req.mapper';
import { SpreadPlanMapper as TlSpreadPlanMapper } from './mappers/response/tl/spread-plan.mapper';
import { CommissionPlanMapper as TlCommissionPlanMapper } from './mappers/response/tl/commission-plan.mapper';

import { CtErrorMapper } from './mappers/error/ct-error.mapper';
import { CtRequestMapper } from './mappers/request/ct-request.mapper';
import { CtResponseMapper } from './mappers/response/ct-response.mapper';
import { OrderMapper as CtOrderMapper } from './mappers/response/ct/order.mapper';
import { SymbolMapper as CtSymbolMapper } from './mappers/response/ct/symbol.mapper';
import { TraderMapper as CtAccountMapper } from './mappers/response/ct/trader.mapper';
import { HolidayMapper as CtHolidayMapper } from './mappers/response/ct/holiday.mapper';
import { PositionMapper as CtPositionMapper } from './mappers/response/ct/position.mapper';
import { OrderReqMapper as CtOrderReqMapper } from './mappers/request/ct/order-req.mapper';
import { TrendbarMapper as CtTrendbarMapper } from './mappers/response/ct/trendbar.mapper';
import { TraderReqMapper as CtTraderReqMapper } from './mappers/request/ct/trader-req.mapper';
import { BalanceReqMapper as CtBalanceReqMapper } from './mappers/request/ct/balance-req.mapper';
import { CountryReqMapper as CtCountryReqMapper } from './mappers/request/ct/country-req.mapper';
import { TrendbarReqMapper as CtTrendbarReqMapper } from './mappers/request/ct/trendbar-req.mapper';
import { PositionReqMapper as CtPositionReqMapper } from './mappers/request/ct/position-req.mapper';
import { TraderGroupMapper as CtTraderGroupMapper } from './mappers/response/ct/trader-group.mapper';
import { ScheduleProfileMapper as CtScheduleProfileMapper } from './mappers/response/ct/schedule-profile.mapper';

import { Serializer } from './services/serializer.service';

// Other
import { PlatformFactory } from './factory/platform.factory';
import { TlMapperHelper } from './mappers/helper/tl-mapper.helper';
import { CtMapperHelper } from './mappers/helper/ct-mapper.helper';
import { Mt5MapperHelper } from './mappers/helper/mt5-mapper.helper';

export interface PlatformModuleOptions {
  redisHost: string;
  redisPort: number;
}

interface PlatformOptionsFactory {
  createSearchOptions(): Promise<PlatformModuleOptions> | PlatformModuleOptions;
}

interface PlatformModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  inject?: Array<InjectionToken | OptionalFactoryDependency>;
  useClass?: Type<PlatformOptionsFactory>;
  useExisting?: Type<PlatformOptionsFactory>;
  useFactory?: (...args: unknown[]) => Promise<PlatformModuleOptions> | PlatformModuleOptions;
}

@Global()
@Module({})
export class PlatformModule {
  public static forRootAsync(options: PlatformModuleAsyncOptions): DynamicModule {
    const providers: Provider[] = this.createAsyncProviders(options);

    return {
      module: PlatformModule,
      imports: [
        ...(options.imports ?? []),
        CacheModule.register(),
        I18nModule.forRoot({
          fallbackLanguage: 'en',
          loaderOptions: {
            path: join(__dirname, '/mappers/error/i18n/'),
            watch: true,
          },
          resolvers: [{ use: HeaderResolver, options: ['lang'] }, AcceptLanguageResolver],
        }),
      ],
      providers: [
        ...providers,
        {
          provide: 'REDIS',
          inject: ['PLATFORM_CONFIG_OPTIONS'],
          useFactory: (opts: PlatformModuleOptions) => {
            const port = opts.redisPort;
            const host = opts.redisHost;

            return new Redis(port, host, { keepAlive: 1, reconnectOnError: () => true });
          },
        },
        Serializer,

        // Core
        Mt5RequestMapper,
        Mt5ResponseMapper,
        Mt5MapperHelper,
        Mt5ErrorMapper,

        TlResponseMapper,
        TlRequestMapper,
        TlMapperHelper,
        TlErrorMapper,

        CtRequestMapper,
        CtResponseMapper,
        CtMapperHelper,
        CtErrorMapper,

        PlatformFactory,

        // Response Mappers
        Mt5AccountMapper,
        Mt5BarMapper,
        Mt5DealMapper,
        Mt5CommissionGroupMapper,
        MT5HolidayMapper,
        Mt5JournalMapper,
        Mt5OrderMapper,
        Mt5PositionMapper,
        Mt5SymbolMapper,
        Mt5UserGroupMapper,

        TlAccountMapper,
        TlCommissionPlanMapper,
        TlPositionMapper,
        TlReportMapper,
        TlRiskPlanMapper,
        TlSpreadPlanMapper,
        TlSymbolMapper,
        TlUserGroupMapper,

        CtAccountMapper,
        CtHolidayMapper,
        CtOrderMapper,
        CtPositionMapper,
        CtScheduleProfileMapper,
        CtSymbolMapper,
        CtTraderGroupMapper,
        CtTrendbarMapper,

        // Request Mappers
        Mt5BalanceOperationReqMapper,
        Mt5GroupReqMapper,
        Mt5CommandReqMapper,

        TlAccountReqMapper,

        CtBalanceReqMapper,
        CtCountryReqMapper,
        CtOrderReqMapper,
        CtPositionReqMapper,
        CtTraderReqMapper,
        CtTrendbarReqMapper,
      ],
      exports: ['PLATFORM_CONFIG_OPTIONS', PlatformFactory],
    };
  }

  private static createAsyncProviders(options: PlatformModuleAsyncOptions): Provider[] {
    const providers: Provider[] = [this.createAsyncOptionsProvider(options)];

    if (options.useClass) {
      providers.push({ provide: options.useClass, useClass: options.useClass });
    }

    return providers;
  }

  private static createAsyncOptionsProvider(options: PlatformModuleAsyncOptions): Provider {
    if (options.useFactory) {
      return {
        provide: 'PLATFORM_CONFIG_OPTIONS',
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    return {
      provide: 'PLATFORM_CONFIG_OPTIONS',
      useFactory: async (optionsFactory: PlatformOptionsFactory) => {
        return optionsFactory.createSearchOptions();
      },
      inject: [options.useExisting! || options.useClass!],
    };
  }
}
