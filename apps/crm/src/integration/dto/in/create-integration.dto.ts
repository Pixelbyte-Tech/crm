import { Transform } from 'class-transformer';
import { Min, IsInt, IsEnum, Validate, IsOptional, IsISO31661Alpha2 } from 'class-validator';

import { IntegrationName } from '@crm/types';
import { toArray, toBoolean } from '@crm/validation';

export class CreateIntegrationDto {
  /** A name of the integration to create  */
  @IsEnum(IntegrationName)
  name: IntegrationName;

  /** Whether the integration should be automatically enabled */
  @IsOptional()
  @Validate(toBoolean)
  @Transform(toBoolean)
  isEnabled: boolean = false;

  /** The integration settings */
  // todo type these
  settings: Record<string, any>;

  /** The order of priority for this integration, lower is higher priority */
  @IsOptional()
  @IsInt()
  @Min(0)
  priority?: number | null;

  /** Countries to allow using the integration, empty allows all */
  @IsOptional()
  @IsISO31661Alpha2({ each: true })
  @Transform(toArray(String))
  allowedCountries?: string[] | null;

  /** Countries to exclude from using the integration, empty excludes none */
  @IsOptional()
  @IsISO31661Alpha2({ each: true })
  @Transform(toArray(String))
  excludedCountries?: string[] | null;
}
