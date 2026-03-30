import { createHash, randomBytes } from 'node:crypto';

import Redis from 'ioredis';
import { DateTime } from 'luxon';
import objectHash from 'object-hash';
import { Logger } from '@nestjs/common';
import { Cache } from '@nestjs/cache-manager';
import { cloneDeep, isBoolean } from 'lodash';
import { AxiosError, InternalAxiosRequestConfig } from 'axios';

import { Platform } from '@crm/types';
import { getTimezoneOffset } from '@crm/utils';

import { MTCredentials, PlatformServer } from '../../models';

import { CircuitBreakerAxios } from '../internal/circuit-breaker-axios.service';

import { ErrorMapper } from '../../mappers/error/error-mapper.interface';
import { RequestMapper } from '../../mappers/request/request-mapper.interface';
import { ResponseMapper } from '../../mappers/response/response-mapper.interface';
import { InvalidServerUrlException, InvalidServerCredentialsException } from '../../exceptions';

type Mt5Token = {
  srv_rand: string;
  cli_rand: string;
  cli_rand_answer: string;
  version_access: string;
  version_trade: string;
  createdAt: number;
};

interface Mt5AuthStart {
  retcode: string;
  version_access: string;
  srv_rand: string;
}

interface Mt5AuthAnswer {
  retcode: string;
  version_access: string;
  version_trade: string;
  cli_rand_answer: string;
}

const KEY_TOKEN = '{platforms}:mt_auth:token';
const KEY_STATUS = '{platforms}:mt_auth:updating';

export abstract class AbstractMtService {
  protected constructor(
    protected readonly axios: CircuitBreakerAxios,
    protected readonly _server: PlatformServer<MTCredentials>,
    protected readonly cache: Cache,
    protected readonly redis: Redis,
    protected readonly resMapper: ResponseMapper,
    protected readonly reqMapper: RequestMapper,
    protected readonly errorMapper: ErrorMapper,
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

    // Setup axios
    this.axios.defaults['baseURL'] = this._server.endpoint;
    for (const key of ['put', 'patch', 'delete', 'common'] as const) {
      this.axios.defaults.headers[key]['Accept'] = 'application/json';
      this.axios.defaults.headers[key]['Content-Type'] = 'application/json';
      this.axios.defaults.headers[key]['Accept-Encoding'] = 'gzip,deflate,compress';
      this.axios.defaults.headers[key]['User-Agent'] = 'PixelByte CRM';
    }

    // Request interceptor, handles token authentication
    this.axios.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
      if (!config.url?.includes('api/auth/start') && !config.url?.includes('api/auth/answer')) {
        if (await this.#isTokenExpired()) {
          await this.#updateToken();
        }
      }
      return config;
    });

    // Response interceptor, handles error decoding, mapping & reporting
    this.axios.interceptors.response.use(null, async (error: AxiosError<any>) => {
      // If we see a 401 or 403 status code, invalidate the token
      const invalidateToken = [401, 403].includes(Number(error?.response?.status));
      if (invalidateToken) {
        this.#logger.warn(`Invalidating ${Platform.MT5} token for '${this._server.endpoint}'`);
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
  async #token(token?: Mt5Token | null): Promise<Mt5Token | undefined> {
    const key = `${KEY_TOKEN}:${this.#makeKeySuffix(this._server)}`;

    if (null === token) {
      await this.cache.del(key);
      await this.redis.del(key);
      return undefined;
    }

    if (token) {
      const t = JSON.stringify(token);
      await this.cache.set(key, t, 10_000);
      await this.redis.set(key, t, 'EX', 600);

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
   */
  async #updateToken(silent: boolean = false): Promise<boolean> {
    // If the token is already being updated, wait for it to finish
    if (await this.#isTokenUpdating()) {
      const now = DateTime.utc().toUnixInteger();
      while (now > DateTime.utc().minus({ seconds: 30 }).toUnixInteger()) {
        if (!(await this.#isTokenUpdating())) {
          return !(await this.#isTokenExpired());
        }

        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      return false;
    }

    // Prepare the log message
    const msg = `Fetching ${Platform.MT5} token for '${this.server.endpoint}'`;
    this.#logger.log(`${msg}`);

    // Lock the token fetching status
    if (!silent) await this.#isTokenUpdating(true);

    try {
      // Fetch the token
      const { username } = this._server.credentials;
      const { data: start, headers } = await this.axios.get<Mt5AuthStart>(
        `/api/auth/start?version=484&agent=pixel_byte_crm&login=${username}&type=manager`,
        { timeout: 10_000 },
      );

      // Ensure the response is valid
      if (!start.retcode.startsWith('0')) {
        this.#logger.error(`${msg}. Invalid retcode - Failed`);
        return false;
      }

      // Extract cookies and set to axios instance for subsequent requests
      this.axios.defaults.headers.common['Cookie'] = headers['set-cookie']?.join('; ') || '';

      // Generate srvRandAnswer & cliRand, then fetch the rest of the token data with those values
      const srvRandAnswer = this.#calculateSrvRandAnswer(start.srv_rand);
      const cliRand = randomBytes(16).toString('hex');

      const { data: answer } = await this.axios.get<Mt5AuthAnswer>(
        `/api/auth/answer?srv_rand_answer=${srvRandAnswer}&cli_rand=${cliRand}`,
        { timeout: 10_000 },
      );

      await this.#token({
        srv_rand: start.srv_rand,
        cli_rand: cliRand,
        cli_rand_answer: answer.cli_rand_answer ?? '',
        version_access: answer.version_access ?? '',
        version_trade: answer.version_trade ?? '',
        createdAt: DateTime.utc().toSeconds(),
      });

      return true;
    } catch (err) {
      this.#logger.error(`${msg} - Failed`, err);
      return false;
    } finally {
      // Un-lock the token fetching status
      if (!silent) await this.#isTokenUpdating(false);
    }
  }

  /**
   * Returns true if the token is expired, false otherwise
   */
  async #isTokenExpired(): Promise<boolean> {
    const token = await this.#token();
    return !token || token.createdAt + 10 < DateTime.utc().toSeconds();
  }

  /**
   * Gets or sets the token fetching state
   * @param state true if a token is being fetched, false otherwise
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
    return DateTime.fromSeconds(this.utcSecToServerSec(unixTime)).toFormat('yyyy-MM-dd HH:mm:ss');
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
   * Calculates the src_rand_answer for the given srv_rand
   * @param srvRand The srv_rand value provided by the server
   */
  #calculateSrvRandAnswer(srvRand: string): string {
    // Step 1: Hash password with UTF-16LE encoding
    const pwBytes = createHash('md5').update(this._server.credentials.password, 'utf16le').digest();

    // Step 2: Append 'WebAPI' and hash again
    const md5PassPlus = Buffer.concat([pwBytes, Buffer.from('WebAPI', 'utf-8')]);
    const passwordHash = createHash('md5').update(md5PassPlus).digest();

    // Step 3: Calculate srv_rand_answer (password_hash + srv_rand bytes)
    const srvRandBytes = Buffer.from(srvRand, 'hex');
    return createHash('md5')
      .update(Buffer.concat([passwordHash, srvRandBytes]))
      .digest('hex');
  }

  /**
   * Takes in the credentials object passed to the service and ensures it is in
   * a format which is valid for the service's requirements
   * @param credentials The credentials object to validate
   * @param baseUrl The base URL of the platform server
   * @throws InvalidServerCredentialsException If the format is not correct
   */
  #validateCredentials(credentials: unknown, baseUrl: string): void {
    const requiredCredentials = ['endpoint', 'username', 'password'];
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
