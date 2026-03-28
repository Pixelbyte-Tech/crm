import { BullModule } from '@nestjs/bull';
import { HttpModule } from '@nestjs/axios';
import { InjectionToken } from '@nestjs/common/interfaces/modules/injection-token.interface';
import { Type, Global, Module, Provider, DynamicModule, ModuleMetadata } from '@nestjs/common';
import { OptionalFactoryDependency } from '@nestjs/common/interfaces/modules/optional-factory-dependency.interface';

import { DbService, GeoService } from './services';
import { UpdateGeoDbProcessor } from './processors';

export interface GeoModuleOptions {
  redisHost: string;
  redisPort: number;
  geoipAccountId: string;
  geoipLicenseKey: string;
}

interface GeoOptionsFactory {
  createSearchOptions(): Promise<GeoModuleOptions> | GeoModuleOptions;
}

interface GeoModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  inject?: Array<InjectionToken | OptionalFactoryDependency>;
  useClass?: Type<GeoOptionsFactory>;
  useExisting?: Type<GeoOptionsFactory>;
  useFactory?: (...args: unknown[]) => Promise<GeoModuleOptions> | GeoModuleOptions;
}

@Global()
@Module({})
export class GeoModule {
  public static forRootAsync(options: GeoModuleAsyncOptions): DynamicModule {
    const providers: Provider[] = this.createAsyncProviders(options);

    return {
      module: GeoModule,
      imports: [
        ...(options.imports ?? []),
        BullModule.registerQueueAsync({
          name: 'geoip-queue',
          inject: ['GEO_CONFIG_OPTIONS'],
          useFactory: (opts: GeoModuleOptions) => {
            const host = opts.redisHost;
            const port = opts.redisPort;

            return {
              redis: `redis://${host}:${port}`,
              defaultJobOptions: { removeOnComplete: true, removeOnFail: 10 },
            };
          },
        }),
        HttpModule,
      ],
      providers: [...providers, DbService, GeoService, UpdateGeoDbProcessor],
      exports: ['GEO_CONFIG_OPTIONS', GeoService],
    };
  }

  private static createAsyncProviders(options: GeoModuleAsyncOptions): Provider[] {
    const providers: Provider[] = [this.createAsyncOptionsProvider(options)];

    if (options.useClass) {
      providers.push({ provide: options.useClass, useClass: options.useClass });
    }

    return providers;
  }

  private static createAsyncOptionsProvider(options: GeoModuleAsyncOptions): Provider {
    if (options.useFactory) {
      return {
        provide: 'GEO_CONFIG_OPTIONS',
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    return {
      provide: 'GEO_CONFIG_OPTIONS',
      useFactory: async (optionsFactory: GeoOptionsFactory) => {
        return optionsFactory.createSearchOptions();
      },
      inject: [options.useExisting! || options.useClass!],
    };
  }
}
