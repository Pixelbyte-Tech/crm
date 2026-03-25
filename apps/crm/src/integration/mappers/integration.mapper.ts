import { Injectable } from '@nestjs/common';

import { Integration } from '@crm/types';
import { IntegrationEntity } from '@crm/database';

@Injectable()
export class IntegrationMapper {
  toIntegration(data: IntegrationEntity): Integration {
    const model = new Integration();
    model.id = data.id;
    model.name = data.name;
    model.type = data.type;
    model.isEnabled = data.isEnabled;
    model.settings = data.settings;
    model.priority = data.priority;
    model.allowedCountries = data.allowedCountries;
    model.excludedCountries = data.excludedCountries;

    model.createdAt = data.createdAt;
    model.updatedAt = data.updatedAt;
    return model;
  }
}
