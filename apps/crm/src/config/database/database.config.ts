import { registerAs } from '@nestjs/config';
import { Min, Max, IsInt, IsString, IsBoolean, IsOptional } from 'class-validator';

import { validateConfig } from '@crm/utils';

import { DatabaseConfig } from './database-config.type';

class ValidationOptions {
  @IsString()
  DATABASE_HOST: string;

  @IsInt()
  @Min(0)
  @Max(65535)
  DATABASE_PORT: number;

  @IsString()
  DATABASE_USERNAME: string;

  @IsString()
  DATABASE_PASSWORD: string;

  @IsString()
  DATABASE_NAME: string;

  @IsInt()
  @IsOptional()
  DATABASE_MAX_CONNECTIONS: number;

  @IsInt()
  @IsOptional()
  DATABASE_IDLE_TIMEOUT_MILLIS: number;

  @IsInt()
  @IsOptional()
  DATABASE_CONNECTION_TIMEOUT_MILLIS: number;

  @IsInt()
  @IsOptional()
  DATABASE_MAX_USES: number;

  @IsBoolean()
  @IsOptional()
  DATABASE_SSL_ENABLED: boolean;

  @IsBoolean()
  @IsOptional()
  DATABASE_REJECT_UNAUTHORIZED: boolean;

  @IsString()
  @IsOptional()
  DATABASE_CA: string;

  @IsString()
  @IsOptional()
  DATABASE_KEY: string;

  @IsString()
  @IsOptional()
  DATABASE_CERT: string;
}

export default registerAs<DatabaseConfig>('database', () => {
  validateConfig(process.env, ValidationOptions);

  return {
    type: 'postgres',
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    name: process.env.DATABASE_NAME,
    synchronize: false,
    maxConnections: process.env.DATABASE_MAX_CONNECTIONS ? parseInt(process.env.DATABASE_MAX_CONNECTIONS, 10) : 200,
    idleTimeoutMillis: process.env.DATABASE_IDLE_TIMEOUT_MILLIS
      ? parseInt(process.env.DATABASE_IDLE_TIMEOUT_MILLIS, 10)
      : 30000,
    connectionTimeoutMillis: process.env.DATABASE_CONNECTION_TIMEOUT_MILLIS
      ? parseInt(process.env.DATABASE_CONNECTION_TIMEOUT_MILLIS, 10)
      : 2000,
    maxUses: process.env.DATABASE_MAX_USES ? parseInt(process.env.DATABASE_MAX_USES, 10) : 7500,
    sslEnabled: process.env.DATABASE_SSL_ENABLED === 'true',
    rejectUnauthorized: process.env.DATABASE_REJECT_UNAUTHORIZED === 'true',
    ca: process.env.DATABASE_CA,
    key: process.env.DATABASE_KEY,
    cert: process.env.DATABASE_CERT,
  };
});
