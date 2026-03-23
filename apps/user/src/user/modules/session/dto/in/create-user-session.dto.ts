import { IsIP, IsString, Validate, IsNotEmpty, IsOptional } from 'class-validator';

import { UserIdValidator } from '@crm/validation';

export class CreateUserSessionDto {
  /** The unique hash to associate with the session */
  @IsString()
  @IsNotEmpty()
  hash: string;

  /** The IP address of the session */
  @IsOptional()
  @IsIP()
  ipAddress?: string | null;

  /** The user agent which created the session */
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  userAgent?: string | null;

  /** The ID of the user */
  @Validate(UserIdValidator)
  userId: string;
}
