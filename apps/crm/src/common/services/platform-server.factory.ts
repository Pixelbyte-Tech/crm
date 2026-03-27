import { Logger, Injectable } from '@nestjs/common';

import { Cryptography } from '@crm/utils';
import { ServerEntity } from '@crm/database';
import { Credentials, PlatformServer } from '@crm/platform';

@Injectable()
export class PlatformServerFactory {
  readonly #logger: Logger = new Logger(this.constructor.name);

  /**
   * Builds a platform server from a server entity
   * @param server The server entity to build from
   */
  toPlatformServer<T extends Credentials = any>(server: ServerEntity): PlatformServer<T> {
    try {
      const settings = JSON.parse(Cryptography.decrypt(server.settings));
      return new PlatformServer({
        monetisation: server.monetisation,
        serverTimeZone: server.timezone,
        endpoint: settings,
        offsetHours: server.offsetHours,
        platform: server.platform,
        credentials: settings,
      });
    } catch (err) {
      this.#logger.error(`Failed to decrypt credentials for server '${server.id}'`, err);
      throw err;
    }
  }
}
