import { Type, Transform } from 'class-transformer';
import { Min, IsInt, IsEnum, Validate, IsOptional, IsISO31661Alpha2 } from 'class-validator';

import { IntegrationName } from '@crm/types';
import { toArray, toBoolean, toUpperCase } from '@crm/validation';

import { IntegrationSetting } from '../../types';
import { SettingsValidator } from '../../validators';

export class UpdateIntegrationDto {
  /** A name of the integration to create  */
  @IsOptional()
  @IsEnum(IntegrationName)
  name: IntegrationName;

  /** Whether the integration should be automatically enabled */
  @IsOptional()
  @Validate(toBoolean)
  @Transform(toBoolean)
  isEnabled: boolean = false;

  /** The settings for the integration */
  @IsOptional()
  @Type(() => Object)
  @Validate(SettingsValidator)
  settings: IntegrationSetting;

  /** The order of priority for this integration, lower is higher priority */
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  priority?: number;

  /** Countries to allow using the integration, empty allows all */
  @IsOptional()
  @IsISO31661Alpha2({ each: true })
  @Transform(toArray(String))
  @Transform(toUpperCase)
  allowedCountries?: string[] | null;

  /** Countries to exclude from using the integration, empty excludes none */
  @IsOptional()
  @IsISO31661Alpha2({ each: true })
  @Transform(toArray(String))
  @Transform(toUpperCase)
  excludedCountries?: string[] | null;
}
