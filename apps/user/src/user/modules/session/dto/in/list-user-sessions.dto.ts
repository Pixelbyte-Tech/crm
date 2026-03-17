import { IsIP, IsString, IsNotEmpty, IsOptional } from 'class-validator';

import { PaginatedReqDto } from '@crm/http';

export class ListUserSessionsDto extends PaginatedReqDto {
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
