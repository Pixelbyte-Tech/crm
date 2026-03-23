import { UserSettingKey } from '../enums';

export class GlobalSettingSubject {
  /** Global setting unique identifier */
  id: string;

  key: UserSettingKey;
  value: string | number | boolean;

  createdAt: Date;
  updatedAt: Date;

  constructor(data?: GlobalSettingSubject) {
    if (data) {
      this.id = data.id;

      this.key = data.key;
      this.value = data.value;

      this.createdAt = data.createdAt;
      this.updatedAt = data.updatedAt;
    }
  }
}
