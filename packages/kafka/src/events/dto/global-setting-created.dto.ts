import { GlobalSetting } from '@crm/types';

export interface GlobalSettingCreatedDto {
  /** The setting */
  setting: GlobalSetting;
  /** The timestamp in (UTC millisecond timestamp) */
  createdAt: number;
}
