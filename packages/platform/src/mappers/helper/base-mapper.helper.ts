import Redis from 'ioredis';
import { Axios } from 'axios';
import { DateTime } from 'luxon';
import objectHash from 'object-hash';
import { Logger } from '@nestjs/common';

import { Serializer } from '../../services/serializer.service';
import { CtManagerApiService } from '../../services/ct/manager/ct-manager-api.service';

export abstract class BaseMapperHelper {
  protected constructor(
    protected readonly serializer: Serializer,
    protected readonly redis: Redis,
    private readonly platform: string,
  ) {}

  readonly #logger = new Logger(this.constructor.name);

  /**
   * Ensures that only one simultaneous request is made to the platform at any time for the
   * same data. This is to avoid multiple requests to the platform for the same data.
   *
   * The requested data is returned from cache if possible and if not the request is made
   * to the platform and the result is cached. During this period, any parallel requests for
   * the same data are all deferred until the original request has completed.
   *
   * @param reqFn The function to call to fetch the requested data
   * @param cacheFn The function to call to fetch the data from cache
   * @param cacheKey The cache key to use for saving the result
   */
  protected async debounceReq<R>(
    reqFn: () => Promise<R>,
    cacheFn: () => Promise<R>,
    cacheKey: string,
  ): Promise<R | null> {
    // Prepare the lock key
    const lockKey = this.lockKey(cacheKey);

    // If the cache is locked we wait for the original request to complete
    if (await this.redis.get(lockKey)) {
      const startTime = DateTime.now().toUnixInteger();
      while (startTime > DateTime.now().minus({ seconds: 60 }).toUnixInteger()) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        if (!(await this.redis.get(lockKey))) {
          return cacheFn();
        }
      }

      return null;
    }

    try {
      // We lock the endpoint and make the request
      await this.redis.set(lockKey, 1, 'EX', 60);
      const data = await reqFn();

      // Check if the redis cache is too large and clear it if it is.
      // Large caches can cause performance issues due to large network payloads.
      // Once we move onto Redis 7.4, we can expire each HSET key individually based on a TTL.
      if (data && this.#approxByteSize(data) > 4_000_000) {
        this.#logger.debug(`Clearing cache for '${cacheKey}' due to large size`);
        await this.redis.del(cacheKey);
      }

      return data;
    } catch (err) {
      this.#logger.error(err);
      return null;
    } finally {
      await this.redis.del(lockKey);
    }
  }

  /**
   * Constructs a standardized cache key based on a sub-key
   * @param key The key to use
   * @param client The relevant client linked to the platform
   */
  protected cacheKey(key: string, client: Axios | CtManagerApiService): string {
    let suffix: string | undefined;

    if ('defaults' in client && client?.defaults?.baseURL) {
      suffix = client.defaults?.baseURL;
    }

    if ('details' in client && client?.details) {
      suffix = client.details?.plant + client.details?.proxy + client.details?.environment;
    }

    suffix = suffix ?? objectHash(client);

    return `{platforms}:cache:${this.platform}:${key.trim()}:${objectHash(suffix)}`;
  }

  /**
   * Constructs a standardized lock key based on a sub-key
   * @param key The key to use
   */
  protected lockKey(key: string): string {
    return `{platforms}:cache:${this.platform}:locks:${objectHash(key.trim())}`;
  }

  /**
   * Returns the approx byte size of a variable
   * @param v The variable to test
   */
  #approxByteSize(v: any): number {
    try {
      if (v === null || v === undefined) {
        return 0;
      }

      // Approximate size for numbers
      if ('number' === typeof v) {
        return 8;
      }

      // Approximate size for booleans
      if ('boolean' === typeof v) {
        return 4;
      }

      if ('string' === typeof v) {
        return new TextEncoder().encode(v).length;
      }

      if (v instanceof Map || v instanceof Set) {
        let totalSize = 0;
        for (const [k, val] of v.entries()) {
          if ('string' === typeof k) {
            totalSize += this.#approxByteSize(k) + this.#approxByteSize(val);
          }
        }

        return totalSize;
      }

      if (Array.isArray(v)) {
        return v.reduce((sum, val) => sum + this.#approxByteSize(val), 0);
      }

      if ('object' === typeof v) {
        return Object.keys(v).reduce(
          (s, k) => s + this.#approxByteSize(k) + this.#approxByteSize(JSON.stringify(v[k])),
          0,
        );
      }

      return 0;
    } catch (err) {
      this.#logger.error(`Error calculating approx byte size`, { v, err });
      return 0;
    }
  }
}
