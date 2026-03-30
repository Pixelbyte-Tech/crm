import { Logger, Injectable, OnModuleInit } from '@nestjs/common';
import { Reader, Country, ReaderModel } from '@maxmind/geoip2-node';

import { Env } from '@crm/utils';

import { DbService } from './db.service';

import { GeoipLookupException, GeoipDatabaseException, GeoipDatabaseDownloadException } from '../exceptions';

@Injectable()
export class GeoService implements OnModuleInit {
  constructor(private readonly dbService: DbService) {}

  readonly #logger = new Logger(this.constructor.name);

  /* The MaxMind database reader instance */
  #reader: ReaderModel;

  /**
   * Automatically executed when the module is initialised.
   */
  onModuleInit(): void {
    // Update the database in the background
    void this.#updateDb();

    // Initialise the database reader in the background
    void this.#initReader();
  }

  /**
   * Updates the MaxMind database if it is not up to date.
   */
  async #updateDb(): Promise<void> {
    if (Env.isDev()) {
      return;
    }

    const msg = `Updating maxmind DB`;
    this.#logger.log(`${msg} - Start`);

    try {
      if (!(await this.dbService.isUpToDate())) {
        await this.dbService.update();
      }

      this.#logger.log(`${msg} - Complete`);
    } catch (err: unknown) {
      let delay = 5_000;
      if (err instanceof GeoipDatabaseDownloadException) {
        delay = err.cause?.hasOwnProperty('status') && 429 === err.cause['status'] ? 120_000 : delay;
      }

      // Wait and try again
      setTimeout(async () => await this.#updateDb(), delay);
      this.#logger.warn(`${msg} - Failed`);
    }
  }

  /**
   * Initialises the MaxMind database reader.
   */
  async #initReader(): Promise<void> {
    const msg = `Initializing maxmind reader`;
    this.#logger.log(`${msg} - Start`);

    try {
      this.#reader = await Reader.open(this.dbService.path);
      this.#logger.log(`${msg} - Complete`);
    } catch (err) {
      // Wait and try again
      this.#logger.error(`${msg} - Failed`, err);
      setTimeout(async () => await this.#initReader(), 2000);
    }
  }

  /**
   * Get the country-level information for a given IP address.
   * @param ip The IP address to look up.
   * @throws GeoipDatabaseException if the database is not loaded.
   * @throws GeoipLookupException if the lookup fails.
   */
  get(ip: string): Country {
    if (!this.#reader) {
      throw new GeoipDatabaseException();
    }

    try {
      return this.#reader.country(ip);
    } catch (err) {
      this.#logger.error(`Failed to lookup ip ${ip}`, err);
      throw new GeoipLookupException(ip);
    }
  }
}
