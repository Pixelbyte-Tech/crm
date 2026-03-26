import Redis from 'ioredis';
import { Axios } from 'axios';
import { Inject, Logger, Injectable } from '@nestjs/common';

import { Mt5Group } from '../../types/mt5/account/group.type';

import { Serializer } from '../../services/serializer.service';

import { BaseMapperHelper } from './base-mapper.helper';

@Injectable()
export class Mt5MapperHelper extends BaseMapperHelper {
  public constructor(
    protected readonly serializer: Serializer,
    @Inject('REDIS') protected readonly redis: Redis,
  ) {
    super(serializer, redis, 'mt5');
  }

  readonly #logger = new Logger(this.constructor.name);

  /**
   * Returns a map of group names to their respective currency
   * @param axios The axios client linked to the platform
   * @param groupName The name of the group to get the currency for
   */
  async getGroupCurrenciesMap(axios: Axios, groupName: string): Promise<Map<string, string>> {
    const KEY = this.cacheKey('group_currencies', axios);

    // Get the cached data we have
    const getCached = async () => {
      const groupsMap = new Map<string, string>();
      const obj = (await this.redis.hgetall(KEY)) ?? {};
      for (const [key, value] of Object.entries(obj)) {
        if (value) groupsMap.set(key, value);
      }

      return groupsMap;
    };

    // If the cache has the element we want, return the map
    const groupsMap = await getCached();
    if (groupsMap.has(groupName)) {
      return groupsMap;
    }

    const data = await this.debounceReq<Map<string, string>>(
      async () => {
        try {
          const { data = { data: [] } } = await axios.get<{ data: Mt5Group[] }>(`/groups`);
          for (const group of data.data) {
            groupsMap.set(group.group, group.currency);
            await this.redis.hset(KEY, group.group, group.currency);
          }

          return groupsMap;
        } catch (err) {
          this.#logger.error('Failed to retrieve groups from MT4', err);
          return new Map();
        }
      },
      getCached.bind(this),
      KEY,
    );

    return data ?? new Map();
  }
}
