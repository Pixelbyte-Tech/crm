import { CompanySettingKey } from '../enums';

export class CompanySetting {
  /** Company setting unique identifier */
  id: string;

  key: CompanySettingKey;
  value: string | number | boolean;

  createdAt: Date;
  updatedAt: Date;

  constructor(data?: CompanySetting) {
    if (data) {
      this.id = data.id;

      this.key = data.key;
      this.value = data.value;

      this.createdAt = data.createdAt;
      this.updatedAt = data.updatedAt;
    }
  }
}
