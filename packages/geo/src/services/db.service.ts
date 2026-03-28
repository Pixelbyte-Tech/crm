import * as fs from 'fs';
import * as zlib from 'zlib';
import { pipeline } from 'stream/promises';

import * as tar from 'tar';
import { Queue } from 'bull';
import { DateTime } from 'luxon';
import { lastValueFrom } from 'rxjs';
import { InjectQueue } from '@nestjs/bull';
import { HttpService } from '@nestjs/axios';
import { Logger, Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';

import { GeoJob } from '../types';
import { GeoModuleOptions } from '../geo.module';
import { GeoipDatabaseDownloadException } from '../exceptions';

const DOWNLOAD_URL = 'https://download.maxmind.com/geoip/databases/GeoLite2-Country/download?suffix=tar.gz';

@Injectable()
export class DbService implements OnApplicationBootstrap {
  constructor(
    private readonly http: HttpService,
    @Inject('GEO_CONFIG_OPTIONS') private readonly opts: GeoModuleOptions,
    @InjectQueue('geoip-queue') private readonly queue: Queue,
  ) {}

  readonly #logger = new Logger(this.constructor.name);

  /* The directory where the MaxMind database file is stored */
  readonly #dir = `/usr/local/maxmind`;

  /* Flag indicating if an update is currently in progress */
  #isUpdating = false;

  /**
   * Automatically executed when the application is initialized.
   * Cleans the job queue and schedules a recurring job to update
   * the MaxMind database every 12 hours.
   */
  onApplicationBootstrap(): void {
    void this.#bootstrap();
  }

  /**
   * Bootstraps the job queue
   */
  async #bootstrap() {
    // Flush only repeatable jobs
    for (const job of await this.queue.getRepeatableJobs()) {
      await this.queue.removeRepeatableByKey(job.key);
    }

    // Wait for 2 seconds
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Schedule a recurring job
    await this.queue.add(
      GeoJob.DB_UPDATE,
      {},
      {
        jobId: GeoJob.DB_UPDATE,
        repeat: { cron: '0 */12 * * *' }, // Every 12 hours
        backoff: { type: 'exponential', delay: 60_000 },
      },
    );
  }

  /**
   * Returns the path to the MaxMind database file.
   */
  get path(): string {
    return `${this.#dir}/GeoLite2-Country.mmdb`;
  }

  /**
   * Updates the MaxMind database file on disk by downloading the latest version
   * from MaxMind's servers and extracting it to the appropriate location.
   * @throws GeoipDatabaseDownloadException if the download or extraction fails.
   */
  async update(): Promise<void> {
    if (this.#isUpdating) {
      return;
    }

    const msg = `Update MaxMind database to ${this.#dir}`;
    this.#logger.log(`${msg} - Start`);

    // Set the updating flag to prevent concurrent updates
    this.#isUpdating = true;

    // Ensure the target directory exists
    fs.mkdirSync(this.#dir, { recursive: true });

    // Stream: HTTP -> gunzip -> tar extract (strip top-level folder)
    const extractor = tar.x({ cwd: this.#dir, strip: 1 });

    try {
      // Download the latest database from MaxMind
      const res = await lastValueFrom(
        this.http.get(DOWNLOAD_URL, {
          auth: this.#getAuth(),
          responseType: 'stream',
          timeout: 120_000,
          maxRedirects: 5, // MaxMind may redirect to a CDN; allow redirects.
          validateStatus: (s) => s >= 200 && s < 400, // Accept 2xx and 3xx responses.
        }),
      );

      // Pipe the response data through gunzip and then to the extractor
      // to extract the .mmdb file to the target directory.
      // This avoids storing the entire archive in memory or on disk.
      await pipeline(res.data, zlib.createGunzip(), extractor);
    } catch (err) {
      this.#isUpdating = false;
      this.#logger.error(`${msg} - Failed`, err);
      throw new GeoipDatabaseDownloadException(err);
    }

    try {
      // Find the remote version first (to ensure credentials are valid)
      const version = await this.remoteVersion();
      if (undefined !== version) {
        fs.writeFileSync(`${this.#dir}/VERSION.txt`, version.toISODate() ?? '');
      }
    } catch (err) {
      this.#logger.warn(`${msg} - Warning - Failed to write version file`, err);
    }

    this.#isUpdating = false;
    this.#logger.log(`${msg} - Complete`);
  }

  /**
   * Fetches the remote version date of the MaxMind database by inspecting
   * the Content-Disposition header of the download URL.
   * @throws GeoipDatabaseDownloadException if the request fails.
   */
  localVersion(): DateTime | undefined {
    if (!fs.existsSync(`${this.#dir}/VERSION.txt`)) {
      return undefined;
    }

    try {
      const data = fs.readFileSync(`${this.#dir}/VERSION.txt`);
      return DateTime.fromISO(Buffer.from(data).toString('utf8'));
    } catch (err) {
      this.#logger.error('Failed to read local maxmind db version', err);
      return undefined;
    }
  }

  /**
   * Fetches the remote version date of the MaxMind database by inspecting
   * the Content-Disposition header of the download URL.
   * @throws GeoipDatabaseDownloadException if the request fails.
   */
  async remoteVersion(): Promise<DateTime | undefined> {
    try {
      const res = await lastValueFrom(this.http.head(DOWNLOAD_URL, { auth: this.#getAuth() }));

      const header = res.headers['content-disposition'];
      const match = header.match(/GeoLite2-Country_(\d{8})/);

      return match && match[1] ? DateTime.fromFormat(match[1], 'yyyyLLdd') : undefined;
    } catch (err) {
      this.#logger.error('Failed to read remote maxmind db version', err);
      throw new GeoipDatabaseDownloadException(err);
    }
  }

  /**
   * Checks if the local MaxMind database file is up to date with the remote version.
   * If either version cannot be determined, this method returns false.
   */
  async isUpToDate(): Promise<boolean> {
    const local = this.localVersion();
    const remote = await this.remoteVersion();

    if (local === undefined || remote === undefined) {
      return false;
    }

    return local >= remote;
  }

  /**
   * Returns the authentication credentials for MaxMind's download service.
   */
  #getAuth(): { username: string; password: string } {
    const accountId = this.opts.geoipAccountId;
    const licenseKey = this.opts.geoipLicenseKey;

    return { username: accountId, password: licenseKey };
  }
}
