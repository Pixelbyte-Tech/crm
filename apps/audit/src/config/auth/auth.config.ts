import { IsString } from 'class-validator';
import { registerAs } from '@nestjs/config';

import { validateConfig } from '@crm/utils';

import { AuthConfig } from './auth-config.type';

class ValidationOptions {
  @IsString()
  AUTH_JWT_SECRET: string;

  @IsString()
  AUTH_REFRESH_SECRET: string;
}

export default registerAs<AuthConfig>('auth', () => {
  validateConfig(process.env, ValidationOptions);

  return {
    secret: process.env.AUTH_JWT_SECRET,
    refreshSecret: process.env.AUTH_REFRESH_SECRET,
  };
});
