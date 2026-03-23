import { Transform } from 'class-transformer';
import { IsEnum, IsEmail } from 'class-validator';

import { Role } from '@crm/types';
import { toLowerCase } from '@crm/validation';

export class InviteUserDto {
  /** The email address of the user to invite */
  @Transform(toLowerCase)
  @IsEmail()
  email: string;

  /** The roles to grant to the new user */
  @IsEnum(Role, { each: true })
  roles: Role[];
}
