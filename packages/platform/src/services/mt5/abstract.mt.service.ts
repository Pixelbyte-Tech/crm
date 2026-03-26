import Redis from 'ioredis';
import { DateTime } from 'luxon';
import objectHash from 'object-hash';
import { Logger } from '@nestjs/common';
import { Cache } from '@nestjs/cache-manager';
import { cloneDeep, isBoolean } from 'lodash';
import { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import { CircuitBreakerAxios } from '../internal/circuit-breaker-axios.service';

import { getTimezoneOffset } from '../../utils/time.utils';
import { CredentialType } from '../../factory/platform.factory';
import { ErrorMapper } from '../../mappers/error/error-mapper.interface';
import { MTCredentials, PlatformServer } from '../../models/platform-server';
import { RequestMapper } from '../../mappers/request/request-mapper.interface';
import { ResponseMapper } from '../../mappers/response/response-mapper.interface';
import {
  InvalidServerUrlException,
  PlatformNotSupportedException,
  InvalidServerCredentialsException,
} from '../../exceptions';

type MtToken = {
  scope: string;
  token_type: string;
  access_token: string;
  expires_in: number;
  created_at: number;
  type: CredentialType;
};

const MT5_OK_CODES = [
  'MT_RET_OK',
  'MT_RET_OK_NONE',
  'MT_RET_REQUEST_INWAY',
  'MT_RET_REQUEST_ACCEPTED',
  'MT_RET_REQUEST_PROCESS',
  'MT_RET_REQUEST_PLACED',
  'MT_RET_REQUEST_DONE',
];

const KEY_TOKEN = '{platforms}:mt_auth:token';
const KEY_STATUS = '{platforms}:mt_auth:updating';

type MtVersion = 4 | 5;

export abstract class AbstractMtService {
  protected constructor(
    protected readonly axios: CircuitBreakerAxios,
    protected readonly _server: PlatformServer<MTCredentials>,
    protected readonly credentialType: CredentialType,
    protected readonly cache: Cache,
    protected readonly redis: Redis,
    protected readonly resMapper: ResponseMapper,
    protected readonly reqMapper: RequestMapper,
    protected readonly errorMapper: ErrorMapper,
    protected readonly version: MtVersion,
  ) {
    // Bootstrap the connection
    this.#bootstrap();

    // Set the server offset time
    this.#serverUTCOffsetSec = getTimezoneOffset(this._server.serverTimeZone, this._server.offsetHours) * 60;

    // Check the token expiration every 5 minutes and update it if needed
    // Update is done in the background so that requests are not blocked
    setInterval(async () => {
      if (await this.#isTokenExpired()) {
        await this.#updateToken(true);
      }
    }, 300_000);
  }

  /** The server attached to this service */
  get server(): PlatformServer<MTCredentials> {
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
    // Check whether the axios instance is already configured
    // We do not want to re-run this method if it is already configured
    // because the interceptors will be added multiple times
    if (this.axios.defaults.baseURL === this._server.endpoint) {
      return;
    }

    try {
      // Validate the server URL
      new URL(this._server.endpoint);
    } catch (err) {
      throw new InvalidServerUrlException(this._server.endpoint, err as Error);
    }

    // Ensure credentials are valid
    this.#validateCredentials(this.server.credentials, this.server.endpoint);

    this.axios.defaults['baseURL'] = this._server.endpoint;
    for (const key of ['put', 'patch', 'delete', 'common'] as const) {
      this.axios.defaults.headers[key]['Accept'] = 'application/json';
      this.axios.defaults.headers[key]['Content-Type'] = 'application/json';
      this.axios.defaults.headers[key]['Accept-Encoding'] = 'gzip,deflate,compress';
      this.axios.defaults.headers[key]['User-Agent'] = 'PixelByte CRM';
    }

    this.axios.interceptors.response.use(
      async (response: AxiosResponse) => {
        if (5 !== Number(this.version)) {
          return response;
        }

        // For MT5 we need to check if there is a response code and if it is not OK
        // There can be cases where the HTTP code is 20x but the actual query was not successful
        const mt5Code: string = response.data?.code ?? response.data?.returnCode;

        if (mt5Code && !MT5_OK_CODES.includes(mt5Code)) {
          const error = {
            code: mt5Code,
            response: { data: { Message: `Error (${mt5Code})` }, config: response.config },
            isAxiosError: true,
            status: response.status,
          } as AxiosError;

          this.#reportError(error);
          return Promise.reject(this.errorMapper.map(error));
        }

        return response;
      },
      async (error: AxiosError) => {
        // Report error
        this.#reportError(error);

        // Invalidate token if 401 is received
        if (401 === Number(error?.response?.status)) {
          this.#logger.warn(`Invalidating MT${this.version} token for ${this._server.endpoint}`);
        }

        return Promise.reject(this.errorMapper.map(error));
      },
    );

    // If we are using oauth, we need to configure the token
    this.axios.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
      if (config.url !== '/oauth2/token') {
        if (await this.#isTokenExpired()) {
          await this.#updateToken();
        }

        config.headers.set('Authorization', `Bearer ${(await this.#token())?.access_token}`);
      }
      return config;
    });
  }

  /**
   * Gets or sets a shared token for all requests
   * Uses a local cache for up to 2 seconds to avoid hitting the redis server during
   * high frequency traffic.
   * @param token the token to set
   */
  async #token(token?: MtToken): Promise<MtToken | undefined> {
    const key = `${KEY_TOKEN}:${this.#makeKeySuffix(this._server)}`;

    if (null === token) {
      await this.cache.del(key);
      await this.redis.del(key);
      return undefined;
    }

    if (token) {
      const t = JSON.stringify(token);
      await this.cache.set(key, t, 10_000);
      await this.redis.set(key, t, 'EX', token.expires_in);
      return undefined;
    }

    let t = await this.cache.get<string>(key);
    if (!t) {
      t = (await this.redis.get(key)) ?? undefined;
      if (t) {
        await this.cache.set(key, t, 10_000);
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
      const now = DateTime.now().toUnixInteger();
      while (now > DateTime.now().minus({ seconds: 30 }).toUnixInteger()) {
        if (!(await this.#isTokenUpdating())) {
          return !(await this.#isTokenExpired());
        }

        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      return false;
    }

    const msg = `Fetching MT${this.version} token for '${this._server.endpoint}'`;
    this.#logger.log(`${msg}`);

    // Lock the token fetching status
    if (!silent) await this.#isTokenUpdating(true);

    // Fetch the token
    const { username, password } = this._server.credentials;
    const response: AxiosResponse | undefined = await this.axios
      .post(`/oauth2/token`, new URLSearchParams({ grant_type: 'password', username, password }), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 30_000,
      })
      .catch((err) => {
        this.#logger.error(`${msg} - Failed`, err);
        return undefined;
      });

    const freshToken = response?.data?.access_token;
    if (freshToken) {
      await this.#token({
        ...response.data,
        created_at: DateTime.utc().toSeconds(),
        type: this.credentialType,
      });
    }

    // Un-lock the token fetching status
    if (!silent) await this.#isTokenUpdating(false);
    return freshToken;
  }

  /**
   * Returns true if the token is expired, false otherwise
   * @private
   */
  async #isTokenExpired(): Promise<boolean> {
    const token = await this.#token();
    return !token || token.created_at + token.expires_in - 3600 < DateTime.utc().toSeconds();
  }

  /**
   * Gets or sets the token fetching state
   * @param state true if a token is being fetched, false otherwise
   * @private
   */
  async #isTokenUpdating(state?: boolean): Promise<boolean> {
    const key = `${KEY_STATUS}:${this.#makeKeySuffix(this._server)}`;

    if (!isBoolean(state)) {
      const status = await this.redis.get(key);
      return status ? JSON.parse(status) : false;
    }

    if (state) {
      await this.redis.set(key, JSON.stringify(state), 'EX', 60);
    } else {
      await this.redis.del(key);
    }

    return true;
  }

  /**
   * Converts a unix timestamp to a mt timestamp based on the mt version.
   * @param unixTime UTC timestamp in seconds
   * @protected
   */
  protected utcSecToServerTime(unixTime: number): string {
    switch (this.version) {
      case 4:
        return DateTime.fromSeconds(this.utcSecToServerSec(unixTime)).toFormat("yyyy-MM-dd'T'HH:mm:ss'Z'");
      case 5:
        return DateTime.fromSeconds(this.utcSecToServerSec(unixTime)).toFormat('yyyy-MM-dd HH:mm:ss');
      default:
        this.#logger.error(`Invalid Mt version '${this.version}'`);
        throw new PlatformNotSupportedException(this._server.platform, this.version);
    }
  }

  /**
   * Converts a UTC timestamp to a server timestamp in server time.
   * @param utcSec UTC timestamp in seconds
   * @protected
   */
  protected utcSecToServerSec(utcSec: number): number {
    return DateTime.fromSeconds(utcSec).plus({ second: this.#serverUTCOffsetSec }).toSeconds();
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
   * Reports an error to sentry and logs it to the console
   * @param error error to report
   */
  #reportError(error: AxiosError): void {
    const url = error?.response?.config?.url ?? error?.config?.url ?? 'n/a';
    const baseUrl = error?.response?.config?.baseURL ?? error?.config?.baseURL ?? 'n/a';
    const method = error?.response?.config?.method ?? error?.config?.method ?? 'n/a';
    const data = error?.response?.config?.data ?? error?.config?.data ?? 'n/a';

    const sc = this.server.credentials;

    // Log request/response to console
    this.#logger.error('PLATFORM_ERR', {
      baseUrl: baseUrl,
      credentials: {
        manager: sc.username,
      },
      req: {
        url: url,
        method: method.toUpperCase(),
        params: error?.response?.config?.params ?? error?.config?.params ?? {},
        data: data,
      },
      res: error?.response?.data ?? {},
      msg: error?.message ?? 'n/a',
    });
  }

  /**
   * Takes in the credentials object passed to the service and ensures it is in
   * a format which is valid for the service's requirements
   * @param credentials The credentials object to validate
   * @param baseUrl The base URL of the platform server
   * @throws InvalidServerCredentialsException If the format is not correct
   */
  #validateCredentials(credentials: unknown, baseUrl: string): void {
    const requiredCredentials = ['username', 'password'];
    const missingProperties = requiredCredentials.filter((prop) => !credentials?.hasOwnProperty(prop));

    if (missingProperties.length) {
      throw new InvalidServerCredentialsException(baseUrl);
    }
  }

  /**
   * Generates a unique key suffix for the server provided
   * @param server The server to generate the key for
   */
  #makeKeySuffix(server: PlatformServer<MTCredentials>): string {
    return `${server.endpoint.replace(/https?:\/\//g, '')}:${objectHash(server.credentials)}`;
  }
}
