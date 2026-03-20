import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { InjectionToken } from '@nestjs/common/interfaces/modules/injection-token.interface';
import { Type, Global, Module, Provider, DynamicModule, ModuleMetadata } from '@nestjs/common';
import { OptionalFactoryDependency } from '@nestjs/common/interfaces/modules/optional-factory-dependency.interface';

import { UserEntity } from '@crm/database';

import { UserStatusGuard } from './guards';
import { AuthHelperService } from './services';
import { CaslModule } from './modules/casl/casl.module';
import { JwtStrategy, JwtRefreshStrategy } from './strategies';

export interface AuthModuleOptions {
  jwtSecret: string;
  refreshSecret: string;
}

interface AuthOptionsFactory {
  createSearchOptions(): Promise<AuthModuleOptions> | AuthModuleOptions;
}

interface AuthModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  inject?: Array<InjectionToken | OptionalFactoryDependency>;
  useClass?: Type<AuthOptionsFactory>;
  useExisting?: Type<AuthOptionsFactory>;
  useFactory?: (...args: unknown[]) => Promise<AuthModuleOptions> | AuthModuleOptions;
}

@Global()
@Module({})
export class AuthModule {
  public static forRootAsync(options: AuthModuleAsyncOptions): DynamicModule {
    const providers: Provider[] = this.createAsyncProviders(options);

    return {
      module: AuthModule,
      imports: [
        ...(options.imports ?? []),
        CaslModule,
        JwtModule.register({}),
        PassportModule,
        TypeOrmModule.forFeature([UserEntity]),
      ],
      providers: [...providers, AuthHelperService, JwtStrategy, JwtRefreshStrategy, UserStatusGuard],
      exports: [
        'AUTH_CONFIG_OPTIONS',
        CaslModule,
        JwtModule,
        AuthHelperService,
        TypeOrmModule.forFeature([UserEntity]),
      ],
    };
  }

  private static createAsyncProviders(options: AuthModuleAsyncOptions): Provider[] {
    const providers: Provider[] = [this.createAsyncOptionsProvider(options)];

    if (options.useClass) {
      providers.push({ provide: options.useClass, useClass: options.useClass });
    }

    return providers;
  }

  private static createAsyncOptionsProvider(options: AuthModuleAsyncOptions): Provider {
    if (options.useFactory) {
      return {
        provide: 'AUTH_CONFIG_OPTIONS',
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    return {
      provide: 'AUTH_CONFIG_OPTIONS',
      useFactory: async (optionsFactory: AuthOptionsFactory) => {
        return optionsFactory.createSearchOptions();
      },
      inject: [options.useExisting! || options.useClass!],
    };
  }
}
