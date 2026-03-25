import { Platform, Monetisation } from '@crm/types';

export class Server {
  /** Server unique identifier */
  id: string;
  name: string;
  platform: Platform;
  monetisation: Monetisation;
  isEnabled: boolean;
  settings: Record<string, any>;
  timezone: string;
  offsetHours: number;
  integrationId: string;

  createdAt: Date;
  updatedAt: Date;

  constructor(data?: Server) {
    if (data) {
      this.id = data.id;
      this.name = data.name;
      this.platform = data.platform;
      this.monetisation = data.monetisation;
      this.isEnabled = data.isEnabled;
      this.settings = data.settings;
      this.timezone = data.timezone;
      this.offsetHours = data.offsetHours;
      this.integrationId = data.integrationId;

      this.createdAt = data.createdAt;
      this.updatedAt = data.updatedAt;
    }
  }
}
