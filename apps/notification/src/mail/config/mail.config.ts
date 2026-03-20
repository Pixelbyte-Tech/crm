import { registerAs } from '@nestjs/config';
import { IsEnum, IsEmail, IsString, IsOptional } from 'class-validator';

import { validateConfig } from '@crm/utils';

import { Transport } from '../types';
import { MailConfig } from './mail-config.type';

class EnvironmentVariablesValidator {
  @IsOptional()
  @IsEnum(Transport)
  MAIL_TRANSPORT?: Transport;

  @IsEmail()
  MAIL_DEFAULT_EMAIL: string;

  @IsString()
  MAIL_DEFAULT_NAME: string;

  @IsString()
  MAIL_ACCESS_KEY_ID: string;

  @IsString()
  MAIL_SECRET_ACCESS_KEY: string;

  @IsOptional()
  @IsString()
  MAIL_AWS_REGION?: string;

  @IsOptional()
  @IsString()
  MAIL_SMTP_HOST?: string;

  @IsOptional()
  @IsString()
  MAIL_SMTP_PORT?: number;
}

export default registerAs<MailConfig>('mail', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    transport: (process.env.MAIL_TRANSPORT as Transport) ?? Transport.SMTP,
    defaultEmail: process.env.MAIL_DEFAULT_EMAIL!,
    defaultName: process.env.MAIL_DEFAULT_NAME!,
    smtp: {
      host: process.env.MAIL_SMTP_HOST ?? 'maildev',
      port: Number(process.env.MAIL_SMTP_HOST ?? '1025'),
    },
    ses: {
      accessKeyId: process.env.MAIL_ACCESS_KEY_ID,
      secretAccessKey: process.env.MAIL_SECRET_ACCESS_KEY,
      awsRegion: process.env.MAIL_AWS_REGION ?? 'eu-west-1',
    },
  };
});
