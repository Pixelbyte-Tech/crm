import Redis from 'ioredis';
import { DateTime } from 'luxon';
import { cloneDeep } from 'lodash';
import { Logger } from '@nestjs/common';
import { Cache } from '@nestjs/cache-manager';
import { AxiosError, InternalAxiosRequestConfig } from 'axios';

import { CircuitBreakerAxios } from '../internal/circuit-breaker-axios.service';

import { getTimezoneOffset } from '../../utils/time.utils';
import { CredentialType } from '../../factory/platform.factory';
import { ErrorMapper } from '../../mappers/error/error-mapper.interface';
import { TLCredentials, PlatformServer } from '../../models/platform-server';
import { RequestMapper } from '../../mappers/request/request-mapper.interface';
import { ResponseMapper } from '../../mappers/response/response-mapper.interface';
import {
  InvalidServerUrlException,
  PlatformNotSupportedException,
  InvalidServerCredentialsException,
} from '../../exceptions';

export abstract class AbstractService {
  protected constructor(
    protected readonly axios: CircuitBreakerAxios,
    protected readonly _server: PlatformServer<TLCredentials>,
    protected readonly credentialType: CredentialType,
    protected readonly cache: Cache,
    protected readonly redis: Redis,
    protected readonly resMapper: ResponseMapper,
    protected readonly reqMapper: RequestMapper,
    protected readonly errorMapper: ErrorMapper,
    protected readonly version: number,
  ) {
    // Bootstrap the connection
    this.#bootstrap();

    // Set the server offset time
    this.#serverUTCOffsetSec = getTimezoneOffset(this._server.serverTimeZone, this._server.offsetHours) * 60;
  }

  /** The server attached to this service */
  get server(): PlatformServer<TLCredentials> {
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
   * Configures the http service with the correct headers and base url
   * @throws InvalidServerUrlException
   */
  #bootstrap(): void {
    try {
      // Validate the server URL
      new URL(this._server.endpoint);
    } catch (err) {
      throw new InvalidServerUrlException(this._server.endpoint, err as Error);
    }

    // Ensure credentials are valid
    this.#validateCredentials(this._server.credentials, this._server.endpoint);

    // Check whether the axios instance is already configured
    // We do not want to re-run this method if it is already configured
    // because the interceptors will be added multiple times
    if (this.axios.defaults.baseURL === this._server.endpoint) {
      return;
    }

    this.axios.defaults['baseURL'] = this._server.endpoint;
    for (const key of ['put', 'patch', 'delete', 'common'] as const) {
      this.axios.defaults.headers[key]['Accept'] = 'application/json';
      this.axios.defaults.headers[key]['Content-Type'] = 'application/json';
      this.axios.defaults.headers[key]['Accept-Encoding'] = 'gzip,deflate,compress';
      this.axios.defaults.headers[key]['User-Agent'] = 'PixelByte CRM';
    }

    // Request interceptor, handles token authentication
    this.axios.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      config.headers.set('brand-api-key', this._server.credentials.apiKey);
      return config;
    });

    // Response interceptor, handles error reporting and mapping
    this.axios.interceptors.response.use(null, async (error: AxiosError<any>) => {
      this.#reportError(error);
      return Promise.reject(this.errorMapper.map(error));
    });
  }

  /**
   * Converts a unix timestamp to a TE timestamp based on the TE version.
   * @param unixTime UTC timestamp in seconds
   * @protected
   */
  protected utcSecToServerTime(unixTime: number): string {
    switch (this.version) {
      case 1:
        return DateTime.fromSeconds(this.utcSecToServerSec(unixTime)).toFormat("yyyy-MM-dd'T'HH:mm:ss'Z'");

      default:
        this.#logger.error(`Invalid TL version '${this.version}'`);
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
   * Takes in the credentials object passed to the service and ensures it is in
   * a format which is valid for the service's requirements
   * @param credentials The credentials object to validate
   * @param baseUrl The base URL of the platform server
   * @throws InvalidServerCredentialsException If the format is not correct
   */
  #validateCredentials(credentials: unknown, baseUrl: string): void {
    const requiredCredentials = ['apiKey'];
    const missingProperties = requiredCredentials.filter((prop) => !credentials?.hasOwnProperty(prop));

    if (missingProperties.length) {
      throw new InvalidServerCredentialsException(baseUrl);
    }
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
}
