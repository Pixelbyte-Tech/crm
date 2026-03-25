import { IntegrationName, IntegrationType } from '../enums';

export class Integration {
  /** Integration unique identifier */
  id: string;
  name: IntegrationName;
  type: IntegrationType;
  isEnabled: boolean;
  settings: Record<string, any>;
  priority: number;
  allowedCountries?: string[] | null;
  excludedCountries?: string[] | null;

  createdAt: Date;
  updatedAt: Date;

  constructor(data?: Integration) {
    if (data) {
      this.id = data.id;
      this.name = data.name;
      this.type = data.type;
      this.isEnabled = data.isEnabled;
      this.settings = data.settings;
      this.priority = data.priority;
      this.allowedCountries = data.allowedCountries;
      this.excludedCountries = data.excludedCountries;

      this.createdAt = data.createdAt;
      this.updatedAt = data.updatedAt;
    }
  }
}
