import { IsString, Validate, IsNotEmpty, IsOptional } from 'class-validator';

import { toBoolean } from '@crm/validation';

export class UpdateNoteDto {
  /** A brief summary  */
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  summary?: string;

  /** The note body */
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  body?: string;

  /** Whether to pin the note */
  @IsOptional()
  @Validate(toBoolean)
  isPinned?: boolean;
}
