import { Transform } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';

import { TenantStatus } from '@crm/types';
import { toArray } from '@crm/validation';
import { PaginatedReqDto } from '@crm/http';

export class ListTenantsDto extends PaginatedReqDto {
  /** The statuses to filter by */
  @IsOptional()
  @IsEnum(TenantStatus, { each: true })
  @Transform(toArray(String))
  status?: TenantStatus[] | null;
}
