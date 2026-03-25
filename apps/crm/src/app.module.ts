import { randomBytes } from 'node:crypto';

import { Module } from '@nestjs/common';
import { SentryModule } from '@sentry/nestjs/setup';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Transport, ClientsModule } from '@nestjs/microservices';

import { AuthModule } from '@crm/auth';
import { SwaggerModule } from '@crm/swagger';
import { DatabaseModule } from '@crm/database';
import { ValidationModule } from '@crm/validation';

import appConfig from './config/app/app.config';
import authConfig from './config/auth/auth.config';
import databaseConfig from './config/database/database.config';

import { CommonModule } from './common/common.module';
import { HealthModule } from './health/health.module';
import { ServerModule } from './server/server.module';
import { AppConfig } from './config/app/app-config.type';
import { AuthConfig } from './config/auth/auth-config.type';
import { IntegrationModule } from './integration/integration.module';
import { DatabaseConfig } from './config/database/database-config.type';

@Module({
  imports: [
    SentryModule.forRoot(),
    AuthModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (c: ConfigService<{ auth: AuthConfig }>) => ({
        jwtSecret: c.getOrThrow<string>('auth.secret', { infer: true }),
        refreshSecret: c.getOrThrow<string>('auth.refreshSecret', { infer: true }),
      }),
    }),
    ClientsModule.registerAsync({
      isGlobal: true,
      clients: [
        {
          imports: [ConfigModule],
          inject: [ConfigService],
          name: 'KAFKA',
          useFactory: (c: ConfigService<{ app: AppConfig }>) => ({
            name: 'KAFKA',
            transport: Transport.KAFKA,
            options: {
              client: {
                brokers: c
                  .getOrThrow('app.kafkaBrokers', { infer: true })
                  .split(',')
                  .map((t) => t.trim()),
              },
              clientId: `${c.getOrThrow('app.appName', { infer: true })}-${randomBytes(4).toString('hex')}`,
              retry: { retries: 20 },
              consumer: {
                groupId: c.getOrThrow('app.appName', { infer: true }),
                allowAutoTopicCreation: true,
                retry: { retries: 20 },
              },
            },
          }),
        },
      ],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, authConfig, databaseConfig],
      envFilePath: ['.env'],
    }),
    CommonModule,
    DatabaseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (c: ConfigService<{ database: DatabaseConfig }>) => ({
        type: 'postgres',
        host: c.getOrThrow('database.host', { infer: true }),
        port: c.getOrThrow('database.port', { infer: true }),
        name: c.getOrThrow('database.name', { infer: true }),
        username: c.getOrThrow('database.username', { infer: true }),
        password: c.getOrThrow('database.password', { infer: true }),
        synchronize: false,
        maxConnections: c.get('database.maxConnections', { infer: true }),
        sslEnabled: c.get('database.sslEnabled', { infer: true }),
        rejectUnauthorized: c.get('database.rejectUnauthorized', { infer: true }),
        ca: c.get('database.ca', { infer: true }),
        key: c.get('database.key', { infer: true }),
        cert: c.get('database.cert', { infer: true }),
        idleTimeoutMillis: c.get('database.idleTimeoutMillis', { infer: true }),
        connectionTimeoutMillis: c.get('database.connectionTimeoutMillis', { infer: true }),
        maxUses: c.get('database.maxUses', { infer: true }),
      }),
    }),
    HealthModule,
    IntegrationModule,
    ServerModule,
    SwaggerModule,
    ValidationModule,
  ],
})
export class AppModule {}
