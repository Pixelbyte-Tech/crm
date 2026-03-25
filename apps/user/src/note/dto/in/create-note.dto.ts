import { Transform } from 'class-transformer';
import { IsString, Validate, IsOptional, IsNotEmpty } from 'class-validator';

import { toBoolean } from '@crm/validation';

export class CreateNoteDto {
  /** A brief summary  */
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  summary?: string;

  /** The note body */
  @IsString()
  @IsNotEmpty()
  body: string;

  /** Whether to pin the new note */
  @IsOptional()
  @Validate(toBoolean)
  @Transform(toBoolean)
  isPinned?: boolean;
}
