import { IsEmail } from 'class-validator';
import { Transform } from 'class-transformer';

import { toLowerCase } from '@crm/validation';

export class ConfirmEmailDto {
  /** The email address to send to */
  @Transform(toLowerCase)
  @IsEmail()
  email: string;
}
