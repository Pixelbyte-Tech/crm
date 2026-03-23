import { Transform } from 'class-transformer';
import { Validate, IsOptional } from 'class-validator';

import { PaginatedReqDto } from '@crm/http';
import { toBoolean, BooleanValidator } from '@crm/validation';

export class ListUsersDto extends PaginatedReqDto {
  @IsOptional()
  @Validate(BooleanValidator)
  @Transform(toBoolean)
  incSettings?: boolean;

  @IsOptional()
  @Validate(BooleanValidator)
  @Transform(toBoolean)
  incDetail?: boolean;
}
