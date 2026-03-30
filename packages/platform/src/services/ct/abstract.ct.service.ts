import Redis from 'ioredis';
import { DateTime } from 'luxon';
import { cloneDeep } from 'lodash';
import objectHash from 'object-hash';
import { Logger } from '@nestjs/common';
import { Cache } from '@nestjs/cache-manager';
import { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import { Cryptography } from '@crm/utils';

import { CTCredentials, PlatformServer } from '../../models';

import { CircuitBreakerAxios } from '../internal/circuit-breaker-axios.service';

import { InvalidServerUrlException } from '../../exceptions';
import { ErrorMapper } from '../../mappers/error/error-mapper.interface';
import { RequestMapper } from '../../mappers/request/request-mapper.interface';
import { ResponseMapper } from '../../mappers/response/response-mapper.interface';

type CtToken = {
  webservToken: string;
  webservTokenLifeTime: number;
  created_at: number;
};

const KEY_TOKEN = '{platforms}:ct_auth:token';
const KEY_STATUS = '{platforms}:ct_auth:updating';

export abstract class AbstractCtService {
  protected constructor(
    protected readonly axios: CircuitBreakerAxios,
    protected readonly _server: PlatformServer<CTCredentials>,
    protected readonly cache: Cache,
    protected readonly redis: Redis,
    protected readonly resMapper: ResponseMapper,
    protected readonly reqMapper: RequestMapper,
    protected readonly errorMapper: ErrorMapper,
  ) {
    // Bootstrap the connection
    this.#bootstrap();

    // Set the server offset time
    // For cTrader this is always in UTC (so we have zero offset)
    this.#serverUTCOffsetSec = 0;

    // Check the token expiration every 2 minutes and update it if needed
    // Update is done in the background so that requests are not blocked
    setInterval(async () => {
      if (await this.#isTokenExpired()) {
        await this.#updateToken(true);
      }
    }, 120_000);
  }

  /** The server attached to this service */
  get server(): PlatformServer<CTCredentials> {
    return cloneDeep(this._server);
  }

  /** Returns a clone of the axios client for this service */
  get client(): CircuitBreakerAxios {
    return new CircuitBreakerAxios(this.axios.axiosInstance, this.axios.breakerOpts);
  }

  /** The UTC offset in seconds for this server */
  get utcOffsetSec(): number {
    return this.#serverUTCOffsetSec;
  }

  /** The logger for this service */
  readonly #logger = new Logger(this.constructor.name);

  /** Server offset time in seconds */
  readonly #serverUTCOffsetSec: number;

  /**
   * Configures the http service with the correct headers and base url.
   * @throws InvalidServerUrlException
   */
  #bootstrap(): void {
    const baseUrl = `${this._server.endpoint}`;

    // Check whether the axios instance is already configured
    // We do not want to re-run this method if it is already configured
    // because the interceptors will be added multiple times
    if (this.axios.defaults.baseURL === baseUrl) {
      return;
    }

    try {
      // Validate the server URL
      new URL(baseUrl);
    } catch (err) {
      throw new InvalidServerUrlException(this._server.endpoint, err as Error);
    }

    this.axios.defaults['baseURL'] = baseUrl;
    for (const key of ['put', 'patch', 'delete', 'common'] as const) {
      this.axios.defaults.headers[key]['Accept'] = 'application/json';
      this.axios.defaults.headers[key]['Content-Type'] = 'application/json';
      this.axios.defaults.headers[key]['Accept-Encoding'] = 'gzip,deflate,compress';
      this.axios.defaults.headers[key]['User-Agent'] = 'PixelByte CRM';
    }

    // Fetch token to be used for this and future requests
    this.axios.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
      if (config.url !== '/v2/webserv/managers/token') {
        if (await this.#isTokenExpired()) {
          await this.#updateToken();
        }

        const token = await this.#token();
        config.url = !config.url?.includes('?')
          ? `${config.url}?token=${token?.webservToken}`
          : `${config.url}&token=${token?.webservToken}`;
      }
      return config;
    });

    this.axios.interceptors.response.use(null, async (error: AxiosError) => {
      // If we see a 401 status code, invalidate the token
      const invalidateToken = 401 === Number(error?.response?.status);

      // Do we need to invalidate the token?
      if (invalidateToken) {
        this.#logger.warn(`Invalidating CT token for ${this._server.endpoint}`);
        await this.#token(null);
      }

      // Report the error
      this.#reportError(error);

      return Promise.reject(this.errorMapper.map(error));
    });
  }

  /**
   * Gets or sets a shared token for all requests
   * @param token the token to set
   */
  async #token(token?: CtToken | null): Promise<CtToken | undefined> {
    const key = `${KEY_TOKEN}:${this.#makeKeySuffix(this._server)}`;

    if (null === token) {
      await this.cache.del(key);
      await this.redis.del(key);
      return undefined;
    }

    if (token) {
      const t = JSON.stringify(token);
      await this.cache.set(key, t, 10 * 1000);
      await this.redis.set(key, t, 'EX', token.webservTokenLifeTime);
      return undefined;
    }

    let t = await this.cache.get<string>(key);
    if (!t) {
      t = (await this.redis.get(key)) ?? undefined;
      if (t) {
        await this.cache.set(key, t, 10 * 1000);
      }
    }

    return t ? JSON.parse(t) : undefined;
  }

  /**
   * Fetches a new oAuth token from the server
   * @param silent if true, will fetch in the background without blocking requests
   * @private
   */
  async #updateToken(silent: boolean = false): Promise<boolean> {
    // If the token is already being updated, wait for it to finish
    if (await this.#isTokenUpdating()) {
      const now = DateTime.utc().toUnixInteger();
      while (now > DateTime.utc().minus({ seconds: 15 }).toUnixInteger()) {
        if (!(await this.#isTokenUpdating())) {
          return !(await this.#isTokenExpired());
        }

        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      return false;
    }

    const msg = `Fetching CT token for '${this._server.endpoint}'`;
    this.#logger.log(`${msg}`);

    if (!silent) await this.#isTokenUpdating(true);

    let response: AxiosResponse | undefined = undefined;

    try {
      response = await this.axios.post<CtToken>(
        `/v2/webserv/managers/token`,
        {
          login: this._server.credentials.username,
          hashedPassword: Cryptography.hashMd5(this._server.credentials.password),
        },
        { timeout: 2000 },
      );
    } catch (err) {
      this.#logger.error(`${msg} - Failed`, err);
    }

    const fetchedToken = response && response.data?.webservToken;
    if (fetchedToken) {
      await this.#token({
        ...response?.data,
        webservTokenLifeTime: 1800,
        created_at: DateTime.utc().toSeconds(),
      });
    }

    if (!silent) await this.#isTokenUpdating(false);
    return fetchedToken;
  }

  /**
   * Returns true if the token is expired, false otherwise
   */
  async #isTokenExpired(): Promise<boolean> {
    const token = await this.#token();
    return !token || token.created_at + token.webservTokenLifeTime - 600 < DateTime.utc().toSeconds();
  }

  /**
   * Gets or sets the token fetching state
   * @param state true if a token is being fetched, false otherwise
   * @private
   */
  async #isTokenUpdating(state?: boolean): Promise<boolean> {
    const key = `${KEY_STATUS}:${this.#makeKeySuffix(this._server)}`;

    if (state !== undefined) {
      await this.redis.set(key, JSON.stringify(state));
      return true;
    }

    const status = await this.redis.get(key);
    return status ? JSON.parse(status) : false;
  }

  /**
   * Converts a unix timestamp to a ct timestamp based on the ct version.
   * @param unixTime UTC timestamp in seconds
   * @protected
   */
  protected utcSecToServerTime(unixTime: number): string {
    return DateTime.fromSeconds(this.utcSecToServerSec(unixTime)).toFormat("yyyy-MM-dd'T'HH:mm:ss.SSS");
  }

  /**
   * Converts a UTC timestamp to a server timestamp in server time.
   * @param utcSec UTC timestamp in seconds
   */
  protected utcSecToServerSec(utcSec: number): number {
    return DateTime.fromSeconds(utcSec).plus({ second: this.#serverUTCOffsetSec }).toSeconds();
  }

  /**
   * Converts a UTC timestamp to a server timestamp in server time.
   * @param utcMs UTC timestamp in milliseconds
   */
  protected utcMsToServerMs(utcMs: number): number {
    return DateTime.fromMillis(utcMs).plus({ second: this.#serverUTCOffsetSec }).toMillis();
  }

  /**
   * Converts a server timestamp in server time to a UTC timestamp.
   * @param serverSec server timestamp in seconds
   * @protected
   */
  protected serverSecToUtcSec(serverSec: number): number {
    return DateTime.fromSeconds(serverSec).minus({ second: this.#serverUTCOffsetSec }).toSeconds();
  }

  /**
   * Converts a server timestamp in server time to a UTC timestamp.
   * @param serverMs server timestamp in milliseconds
   */
  protected serverMsToUtcMs(serverMs: number): number {
    return DateTime.fromMillis(serverMs).minus({ second: this.#serverUTCOffsetSec }).toMillis();
  }

  /**
   * Reports an error to sentry and logs it to the console
   * @param error error to report
   */
  #reportError(error: AxiosError): void {
    const url = error?.response?.config?.url ?? error?.config?.url ?? 'n/a';
    const baseUrl = error?.response?.config?.baseURL ?? error?.config?.baseURL ?? 'n/a';
    const method = error?.response?.config?.method ?? error?.config?.method ?? 'n/a';
    const data = error?.response?.config?.data ?? error?.config?.data ?? 'n/a';

    // Log request/response to console
    this.#logger.error('PLATFORM_ERR', {
      baseUrl: baseUrl,
      credentials: {
        username: this.server.credentials.username,
      },
      req: {
        url: url,
        method: method.toUpperCase(),
        params: error?.response?.config?.params ?? {},
        data: data,
      },
      res: error?.response?.data ?? {},
      msg: error?.message ?? 'n/a',
    });
  }

  /**
   * Generates a unique key suffix for the server provided
   * @param server The server to generate the key for
   */
  #makeKeySuffix(server: PlatformServer<CTCredentials>): string {
    return `${server.endpoint.replace(/https?:\/\//g, '')}:${objectHash(server.credentials)}`;
  }
}
