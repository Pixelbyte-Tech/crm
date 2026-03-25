import { Transform } from 'class-transformer';
import { Validate, IsOptional } from 'class-validator';

import { PaginatedReqDto } from '@crm/http';
import { toBoolean, UserIdValidator } from '@crm/validation';

export class ListNotesDto extends PaginatedReqDto {
  /** Filter by pinned attribute */
  @IsOptional()
  @Validate(toBoolean)
  @Transform(toBoolean)
  pinned?: boolean;

  /** Filter by author */
  @IsOptional()
  @Validate(UserIdValidator)
  authorId?: string;
}
