import { Logger, Injectable } from '@nestjs/common';

import { Cryptography } from '@crm/utils';
import { ServerEntity } from '@crm/database';

import { Server } from '../domain';

@Injectable()
export class ServerMapper {
  readonly #logger = new Logger(this.constructor.name);

  toServer(data: ServerEntity): Server {
    const model = new Server();
    model.id = data.id;
    model.name = data.name;
    model.platform = data.platform;
    model.monetisation = data.monetisation;
    model.isEnabled = data.isEnabled;
    model.timezone = data.timezone;
    model.offsetHours = data.offsetHours;
    model.integrationId = data.integrationId;

    try {
      model.settings = JSON.parse(Cryptography.decrypt(data.settings));
    } catch (err) {
      this.#logger.error(`Failed to parse settings for server '${data.id}'`, err);
      model.settings = {};
    }

    model.createdAt = data.createdAt;
    model.updatedAt = data.updatedAt;
    return model;
  }
}
