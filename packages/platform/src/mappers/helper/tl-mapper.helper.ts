import Redis from 'ioredis';
import { Axios } from 'axios';
import { Inject, Logger, Injectable } from '@nestjs/common';

import { Serializer } from '../../services/serializer.service';

import { BaseMapperHelper } from './base-mapper.helper';
import { TlRiskPlan } from '../../types/tl/plan/risk-plan.type';

@Injectable()
export class TlMapperHelper extends BaseMapperHelper {
  public constructor(
    protected readonly serializer: Serializer,
    @Inject('REDIS') protected readonly redis: Redis,
  ) {
    super(serializer, redis, 'tl');
  }

  readonly #logger = new Logger(this.constructor.name);

  /**
   * Returns a map of risk plans where the key is the risk plan id
   * and the value is the risk plan name
   * This is either retrieved from the cache or from the platform.
   * @param axios The axios client linked to the platform
   * @param environment The environment the server is operating in, either 'live' or 'demo'
   * @param force If true, the cache will be ignored and the data will be fetched from the platform
   */
  async getRiskPlanMap(
    axios: Axios,
    environment: 'live' | 'demo',
    force: boolean = false,
  ): Promise<Map<string, string>> {
    const KEY = this.cacheKey(`${environment}:risk_plans`, axios);

    // Get the cached data we have
    const getCached = async () => {
      const riskMap = new Map<string, string>();
      const obj = (await this.redis.hgetall(KEY)) ?? {};
      for (const [key, value] of Object.entries(obj)) {
        if (value) riskMap.set(key, value);
      }
      return riskMap;
    };

    // If the cache has risk plans, return the map
    const riskMap = !force ? await getCached() : new Map();
    if (riskMap?.size) {
      return riskMap;
    }

    const data = await this.debounceReq<Map<string, string>>(
      async () => {
        try {
          // Fetch the risk plans
          const result = await axios.get<{ data: TlRiskPlan[] }>(`/v1/plans/risk`, {
            params: { type: environment.toUpperCase() },
          });

          // Filter the items by the given string (if required)
          const items: TlRiskPlan[] = result.data.data;
          for (const item of items) {
            riskMap.set(item.id, item.name);
            await this.redis.hset(KEY, item.id, item.name);
          }

          // Expire the cache after 10 mins
          await this.redis.expire(KEY, 600);

          return riskMap;
        } catch (err) {
          this.#logger.error('Failed to retrieve risk plans from TL', err);
          return new Map();
        }
      },
      getCached.bind(this),
      KEY,
    );

    return data ?? new Map();
  }
}
