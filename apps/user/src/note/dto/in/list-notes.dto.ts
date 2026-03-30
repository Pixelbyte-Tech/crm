import { Transform } from 'class-transformer';
import { Validate, IsOptional } from 'class-validator';

import { PaginatedReqDto } from '@crm/http';
import { toBoolean, UserIdValidator, BooleanValidator } from '@crm/validation';

export class ListNotesDto extends PaginatedReqDto {
  /** Filter by pinned attribute */
  @IsOptional()
  @Validate(BooleanValidator)
  @Transform(toBoolean)
  pinned?: boolean;

  /** Filter by author */
  @IsOptional()
  @Validate(UserIdValidator)
  authorId?: string;
}
