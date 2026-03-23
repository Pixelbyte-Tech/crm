import { IsEmail } from 'class-validator';
import { Transform } from 'class-transformer';

import { toLowerCase } from '@crm/validation';

export class ForgotPasswordDto {
  /** The email address to send to */
  @Transform(toLowerCase)
  @IsEmail()
  email: string;
}
