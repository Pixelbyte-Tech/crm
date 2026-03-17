import { IsIP, IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateUserSessionDto {
  /** The unique has to associate with the session */
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
