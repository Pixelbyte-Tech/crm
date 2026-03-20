import { registerAs } from '@nestjs/config';
import { Min, Max, IsInt, IsString } from 'class-validator';

import { validateConfig } from '@crm/utils';

import { AppConfig } from './app-config.type';

class ValidationOptions {
  @IsString()
  NODE_ENV: string;

  @IsString()
  APP_NAME: string;

  @IsString()
  REDIS_HOST: string;

  @IsInt()
  @Min(0)
  @Max(65535)
  REDIS_PORT: number;

  @IsString()
  KAFKA_BROKERS: string;
}

export default registerAs<AppConfig>('app', () => {
  validateConfig(process.env, ValidationOptions);

  return {
    nodeEnv: process.env.NODE_ENV,
    appName: process.env.APP_NAME,
    redisHost: process.env.REDIS_HOST,
    redisPort: Number(process.env.REDIS_PORT),
    kafkaBrokers: process.env.KAFKA_BROKERS,
  };
});
