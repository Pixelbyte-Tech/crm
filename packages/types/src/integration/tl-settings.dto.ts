import { Type } from 'class-transformer';
import { Min, Max, IsInt, IsString, IsNotEmpty } from 'class-validator';

export class TlSettingsDto {
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

  /** The API key */
  @IsString()
  @IsNotEmpty()
  apiKey: string;
}
