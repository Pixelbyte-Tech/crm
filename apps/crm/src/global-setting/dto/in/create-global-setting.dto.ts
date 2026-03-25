import { IsEnum, IsNotEmpty } from 'class-validator';

import { GlobalSettingKey } from '@crm/types';

export class CreateGlobalSettingDto {
  /** The key of the global setting. Must be one of the predefined keys in GlobalSettingKey enum. */
  @IsEnum(GlobalSettingKey)
  key: GlobalSettingKey;

  /** The value of the global setting. Must not be empty. */
  @IsNotEmpty()
  value: any;
}
