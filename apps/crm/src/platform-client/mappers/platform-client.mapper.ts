import { Injectable } from '@nestjs/common';

import { PlatformClientEntity } from '@crm/database';

import { PlatformClient } from '../domain';

@Injectable()
export class PlatformClientMapper {
  toClient(data: PlatformClientEntity): PlatformClient {
    const model = new PlatformClient();
    model.id = data.id;
    model.platform = data.platform;
    model.type = data.type;
    model.link = data.link;
    model.settings = data.settings ?? undefined;

    model.createdAt = data.createdAt;
    model.updatedAt = data.updatedAt;
    return model;
  }
}
