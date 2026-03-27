import http from 'http';
import https from 'https';

import axios from 'axios';
import Redis from 'ioredis';
import objectHash from 'object-hash';
import { Cache } from '@nestjs/cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Logger, Injectable } from '@nestjs/common';

import { Env } from '@crm/utils';
import { Platform } from '@crm/types';

import { Mt5ErrorMapper } from '../mappers/error/mt5-error.mapper';
import { Mt5RequestMapper } from '../mappers/request/mt5-request.mapper';
import { Mt5ResponseMapper } from '../mappers/response/mt5-response.mapper';

import { TlErrorMapper } from '../mappers/error/tl-error.mapper';
import { TlRequestMapper } from '../mappers/request/tl-request.mapper';
import { TlResponseMapper } from '../mappers/response/tl-response.mapper';

import { CtErrorMapper } from '../mappers/error/ct-error.mapper';
import { CtRequestMapper } from '../mappers/request/ct-request.mapper';
import { CtResponseMapper } from '../mappers/response/ct-response.mapper';

import { Credentials, CTCredentials, MTCredentials, TLCredentials, PlatformServer } from '../models';

import { TlService } from '../services/tl/tl.service';
import { CtService } from '../services/ct/ct.service';
import { Mt5Service } from '../services/mt5/mt5.service';
import { Serializer } from '../services/serializer.service';
import { CtManagerApiService } from '../services/ct/manager/ct-manager-api.service';
import { CtSnapshotApiService } from '../services/ct/snapshot/ct-snapshot-api.service';
import { CircuitBreakerAxios } from '../services/internal/circuit-breaker-axios.service';

import { PlatformNotSupportedException } from '../exceptions';
import { PlatformService } from '../services/platform-service.interface';
import { CtMarketPriceService } from '../services/ct/manager/ct-market-price-service';

export { PlatformService } from '../services/platform-service.interface';

@Injectable()
export class PlatformFactory {
  constructor(
    private readonly mt5ErrorMapper: Mt5ErrorMapper,
    private readonly tlErrorMapper: TlErrorMapper,
    private readonly ctErrorMapper: CtErrorMapper,
    private readonly mt5ResMapper: Mt5ResponseMapper,
    private readonly tlResMapper: TlResponseMapper,
    private readonly ctResMapper: CtResponseMapper,
    private readonly mt5ReqMapper: Mt5RequestMapper,
    private readonly tlReqMapper: TlRequestMapper,
    private readonly ctReqMapper: CtRequestMapper,
    private readonly serializer: Serializer,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    @Inject('REDIS') private readonly redis: Redis,
  ) {}

  /** Logger instance */
  readonly #logger = new Logger(this.constructor.name);

  /** A map of PlatformServices to servers */
  #services: Map<string, PlatformService> = new Map();

  /**
   * Gets a platform service based on the parameters provided.
   * @param platformServer The platform server to get the service for
   * @throws PlatformServerNotFoundException
   * @throws PlatformNotSupportedException
   */
  get<R extends PlatformService = PlatformService>(platformServer: PlatformServer<Credentials>): R {
    // Create a unique key for this server and credential type
    const key = `${platformServer.endpoint}-${platformServer.monetisation}-${objectHash(platformServer.credentials)}`;

    // If we have an existing service, return it.
    if (this.#services.has(key)) {
      return this.#services.get(key) as R;
    }

    let instance: PlatformService | undefined;

    // Create an axios instance for this server, using a circuit breaker pattern
    const axiosInstance = new CircuitBreakerAxios(
      axios.create({
        timeout: Env.isProd() ? 15_000 : 60_000, // dev env (esp for brand creation) is a lot slower than production
        httpAgent: new http.Agent({ keepAlive: true }),
        httpsAgent: new https.Agent({ keepAlive: true, rejectUnauthorized: false }),
      }),
      {
        timeout: 120_000,
        allowWarmUp: true,
        volumeThreshold: 10,
        errorThresholdPercentage: 80,
        resetTimeout: 10_000,
      },
    );

    // Otherwise, create a new client and store it
    try {
      switch (platformServer.platform) {
        case Platform.MT5:
          instance = new Mt5Service(
            axiosInstance,
            platformServer as PlatformServer<MTCredentials>,
            this.cache,
            this.redis,
            this.mt5ResMapper,
            this.mt5ReqMapper,
            this.mt5ErrorMapper,
          );
          break;

        case Platform.TL:
          instance = new TlService(
            axiosInstance,
            platformServer as PlatformServer<TLCredentials>,
            this.cache,
            this.redis,
            this.tlResMapper,
            this.tlReqMapper,
            this.tlErrorMapper,
          );
          break;

        case Platform.CT:
          instance = new CtService(
            axiosInstance,
            platformServer as PlatformServer<CTCredentials>,
            this.cache,
            this.redis,
            this.ctResMapper,
            this.ctReqMapper,
            this.ctErrorMapper,
            new CtManagerApiService(this.ctErrorMapper, new CtMarketPriceService(this.serializer, this.redis)),
            new CtSnapshotApiService(this.ctErrorMapper),
          );
          break;
      }
    } catch (err) {
      this.#logger.error(`Error creating platform service: ${err instanceof Error ? err.message : err}`, { err });

      throw err;
    }

    if (!instance) {
      throw new PlatformNotSupportedException(platformServer.platform);
    }

    this.#services.set(key, instance);
    return instance as R;
  }
}
