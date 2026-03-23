import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { SwaggerModule } from '@crm/swagger';
import { DatabaseModule } from '@crm/database';
import { ValidationModule } from '@crm/validation';

import appConfig from './config/app/app.config';
import databaseConfig from './config/database/database.config';

import { CommonModule } from './common/common.module';
import { HealthModule } from './health/health.module';
import { DatabaseConfig } from './config/database/database-config.type';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig],
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
    SwaggerModule,
    ValidationModule,
  ],
})
export class AppModule {}
