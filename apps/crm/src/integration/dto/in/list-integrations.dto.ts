import { Transform } from 'class-transformer';
import { IsEnum, Validate, IsOptional } from 'class-validator';

import { PaginatedReqDto } from '@crm/http';
import { IntegrationName, IntegrationType } from '@crm/types';
import { toArray, toBoolean, BooleanValidator } from '@crm/validation';

export class ListIntegrationsDto extends PaginatedReqDto {
  /** Filter by enabled attribute */
  @IsOptional()
  @Validate(BooleanValidator)
  @Transform(toBoolean)
  enabled?: boolean;

  /** Filter by integration name */
  @IsOptional()
  @IsEnum(IntegrationName, { each: true })
  @Transform(toArray(String))
  name?: IntegrationName[];

  /** Filter by integration type */
  @IsOptional()
  @IsEnum(IntegrationType, { each: true })
  @Transform(toArray(String))
  type?: IntegrationType[];
}
