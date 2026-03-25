import { GlobalSetting } from '@crm/types';

export interface GlobalSettingUpdatedDto {
  /** The setting */
  setting: GlobalSetting;
  /** The timestamp in (UTC millisecond timestamp) */
  updatedAt: number;
}
