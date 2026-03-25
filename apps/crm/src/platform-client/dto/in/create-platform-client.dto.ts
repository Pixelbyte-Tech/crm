import { Type } from 'class-transformer';
import { IsEnum, IsString, IsOptional, IsNotEmpty } from 'class-validator';

import { Platform, PlatformClientType } from '@crm/types';

export class CreatePlatformClientDto {
  /** The client type */
  @IsEnum(PlatformClientType)
  type: PlatformClientType;

  /** The platform the client belongs to */
  @IsEnum(Platform)
  platform: Platform;

  /** The link through which users can access the platform or download the client */
  @IsString()
  @IsNotEmpty()
  link: string;

  /** Any additional settings associated with the client */
  @IsOptional()
  @Type(() => Object)
  settings?: Record<string, any>;
}
