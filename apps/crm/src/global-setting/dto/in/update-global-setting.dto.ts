import { IsNotEmpty } from 'class-validator';

export class UpdateGlobalSettingDto {
  /** The value of the global setting. */
  @IsNotEmpty()
  value: any;
}
