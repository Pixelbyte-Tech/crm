import { IsIP, IsEnum, IsString, IsNotEmpty, IsOptional } from 'class-validator';

import { AuthSessionStatus } from '@crm/types';

export class UpdateUserSessionDto {
  /** The status of the auth session */
  @IsOptional()
  @IsEnum(AuthSessionStatus)
  status?: AuthSessionStatus;

  /** The unique hash to associate with the session */
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  hash?: string | null;

  /** The IP address of the session */
  @IsOptional()
  @IsIP()
  ipAddress?: string | null;

  /** The user agent which created the session */
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  userAgent?: string | null;
}
