import { Type, Transform } from 'class-transformer';
import { Min, Max, IsInt, IsEnum, Validate, IsString, IsOptional, IsNotEmpty } from 'class-validator';

import { Platform, Monetisation } from '@crm/types';
import { toBoolean, BooleanValidator, IntegrationIdValidator } from '@crm/validation';

import { ServerSetting } from '../../types';
import { SettingsValidator } from '../../validators';

export class UpdateServerDto {
  /** A friendly name to apply to the server */
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name: string;

  /** The platform the server belongs to */
  @IsOptional()
  @IsEnum(Platform)
  platform: Platform;

  /** The monetisation of the server */
  @IsOptional()
  @IsEnum(Monetisation)
  monetisation: Monetisation;

  /** Whether the server should be automatically enabled */
  @IsOptional()
  @Validate(BooleanValidator)
  @Transform(toBoolean)
  isEnabled: boolean = false;

  /** The settings for the server */
  @IsOptional()
  @Type(() => Object)
  @Validate(SettingsValidator)
  settings: ServerSetting;

  /** The server timezone */
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  timezone: string;

  /** Any offset hours from the timezone of the server */
  @IsOptional()
  @IsInt()
  @Max(23)
  @Min(-23)
  @Type(() => Number)
  offsetHours?: number | null;

  /** The integration this server belongs to */
  @IsOptional()
  @Validate(IntegrationIdValidator)
  integrationId: string;
}
