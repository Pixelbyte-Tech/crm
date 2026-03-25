import { Type } from 'class-transformer';
import { Min, Max, IsInt, IsString, IsNotEmpty } from 'class-validator';

export class Mt5SettingsDto {
  /** The timezone of the server */
  @IsString()
  @IsNotEmpty()
  timezone: string;

  /** Any offset hours from the timezone of the server */
  @IsInt()
  @Min(-23)
  @Max(23)
  @Type(() => Number)
  offsetHours: number;

  /** The reporting DB host */
  @IsString()
  @IsNotEmpty()
  host: string;

  /** The reporting DB port */
  @IsInt()
  @Min(1)
  @Max(65535)
  @Type(() => Number)
  port: number;

  /** The reporting DB username */
  @IsString()
  @IsNotEmpty()
  username: string;

  /** The reporting DB password */
  @IsString()
  @IsNotEmpty()
  password: string;

  /** The reporting DB name */
  @IsString()
  @IsNotEmpty()
  database: string;
}
