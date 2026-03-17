import { IsEmail } from 'class-validator';
import { Transform } from 'class-transformer';

import { toLowerCase } from '@crm/validation';

export class InviteTenantDto {
  /** The email address of the tenant to invite */
  @Transform(toLowerCase)
  @IsEmail()
  email: string;
}
