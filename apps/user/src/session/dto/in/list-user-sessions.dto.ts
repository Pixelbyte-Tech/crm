import { IsIP, IsEnum, IsString, IsNotEmpty, IsOptional } from 'class-validator';

import { PaginatedReqDto } from '@crm/http';
import { AuthSessionStatus } from '@crm/types';

export class ListUserSessionsDto extends PaginatedReqDto {
  /** The status of the auth session */
  @IsOptional()
  @IsEnum(AuthSessionStatus)
  status?: AuthSessionStatus;

  /** The IP address of the session */
  @IsOptional()
  @IsIP()
  ipAddress?: string;

  /** The user agent which created the session */
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  userAgent?: string;
}
