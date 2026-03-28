import { Logger } from '@nestjs/common';
import { Process, Processor } from '@nestjs/bull';

import { GeoJob } from '../types';
import { DbService } from '../services';

@Processor('geoip-queue')
export class UpdateGeoDbProcessor {
  constructor(private readonly dbService: DbService) {}

  readonly #logger = new Logger(this.constructor.name);

  /**
   * Handles the job
   */
  @Process(GeoJob.DB_UPDATE)
  async handle() {
    const msg = 'Running GeoIP database update job';
    this.#logger.log(`${msg} - Start`);

    // If the database is already up to date, do nothing
    if (await this.dbService.isUpToDate()) {
      this.#logger.log(`${msg} - Complete (already up to date)`);
      return;
    }

    try {
      // Update the database
      await this.dbService.update();
      this.#logger.log(`${msg} - Complete`);
    } catch (err) {
      this.#logger.error(`${msg} - Failed`, err);
      throw err;
    }
  }
}
