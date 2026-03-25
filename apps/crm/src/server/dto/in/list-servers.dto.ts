import { Transform } from 'class-transformer';
import { IsEnum, Validate, IsOptional } from 'class-validator';

import { PaginatedReqDto } from '@crm/http';
import { Platform, Monetisation, IntegrationName } from '@crm/types';
import { toArray, toBoolean, IntegrationIdValidator } from '@crm/validation';

export class ListServersDto extends PaginatedReqDto {
  /** Filter by enabled attribute */
  @IsOptional()
  @Validate(toBoolean)
  @Transform(toBoolean)
  enabled?: boolean;

  /** Filter by platform */
  @IsOptional()
  @IsEnum(Platform, { each: true })
  @Transform(toArray(String))
  platform?: Platform[];

  /** Filter by monetisation */
  @IsOptional()
  @IsEnum(IntegrationName, { each: true })
  @Transform(toArray(String))
  monetisation?: Monetisation[];

  /** Filter by integration */
  @IsOptional()
  @Validate(IntegrationIdValidator)
  integrationId?: string;
}
