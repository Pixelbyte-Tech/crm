export interface GlobalSettingDeletedDto {
  /** The setting id */
  settingId: string;
  /** The timestamp in (UTC millisecond timestamp) */
  deletedAt: number;
}
