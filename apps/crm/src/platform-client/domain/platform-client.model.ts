import { Platform, PlatformClientType } from '@crm/types';

export class PlatformClient {
  /** Platform client unique identifier */
  id: string;
  platform: Platform;
  type: PlatformClientType;
  link: string;
  settings?: Record<string, any>;

  createdAt: Date;
  updatedAt: Date;

  constructor(data?: PlatformClient) {
    if (data) {
      this.id = data.id;
      this.platform = data.platform;
      this.type = data.type;
      this.link = data.link;
      this.settings = data.settings;

      this.createdAt = data.createdAt;
      this.updatedAt = data.updatedAt;
    }
  }
}
