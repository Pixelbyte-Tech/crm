import { Type } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class UpdateGlobalSettingDto {
  /** The value of the global setting. */
  @IsNotEmpty()
  @Type(() => String)
  value: string;
}
