import { Type, Transform } from 'class-transformer';
import { IsDate, Validate, IsOptional } from 'class-validator';

import { PaginatedReqDto } from '@crm/http';
import { toBoolean, BooleanValidator } from '@crm/validation';

export class ListUsersDto extends PaginatedReqDto {
  /** The registration from date to filter by */
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  from?: Date | null;

  /** The registration end date to filter by */
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  to?: Date | null;

  @IsOptional()
  @Validate(BooleanValidator)
  @Transform(toBoolean)
  incSettings?: boolean;

  @IsOptional()
  @Validate(BooleanValidator)
  @Transform(toBoolean)
  incDetail?: boolean;
}
