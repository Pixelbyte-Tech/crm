import { Injectable } from '@nestjs/common';

import { Cryptography } from '@crm/utils';
import { ServerEntity } from '@crm/database';

import { Server } from '../domain';

@Injectable()
export class ServerMapper {
  toServer(data: ServerEntity): Server {
    const model = new Server();
    model.id = data.id;
    model.name = data.name;
    model.platform = data.platform;
    model.monetisation = data.monetisation;
    model.isEnabled = data.isEnabled;
    model.settings = JSON.parse(Cryptography.decrypt(data.settings));
    model.timezone = data.timezone;
    model.offsetHours = data.offsetHours;
    model.integrationId = data.integrationId;

    model.createdAt = data.createdAt;
    model.updatedAt = data.updatedAt;
    return model;
  }
}
