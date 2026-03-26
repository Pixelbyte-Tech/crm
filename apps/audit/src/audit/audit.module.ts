import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '@crm/auth';
import { AuditLogEntity } from '@crm/database';

import { AuditService } from './services';
import { AuditLogMapper } from './mapper';
import { AuthConfig } from '../config/auth/auth-config.type';
import {
  TagController,
  UserController,
  AuditController,
  ServerController,
  UserNoteController,
  IntegrationController,
  GlobalSettingController,
  PlatformClientController,
  TradingAccountSchemaController,
} from './controllers';

@Module({
  imports: [
    AuthModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (c: ConfigService<{ auth: AuthConfig }>) => ({
        jwtSecret: c.getOrThrow<string>('auth.secret', { infer: true }),
        refreshSecret: c.getOrThrow<string>('auth.refreshSecret', { infer: true }),
      }),
    }),
    TypeOrmModule.forFeature([AuditLogEntity]),
  ],
  providers: [AuditLogMapper, AuditService],
  controllers: [
    AuditController,
    GlobalSettingController,
    IntegrationController,
    PlatformClientController,
    ServerController,
    TagController,
    TradingAccountSchemaController,
    UserController,
    UserNoteController,
  ],
})
export class AuditModule {}
