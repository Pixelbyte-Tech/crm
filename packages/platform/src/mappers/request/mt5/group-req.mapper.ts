import Redis from 'ioredis';
import { Axios } from 'axios';
import { Inject, Injectable } from '@nestjs/common';

import { Cryptography } from '@crm/utils';

import { Mt5Group } from '../../../types/mt5/account/group.type';

import { Serializer } from '../../../services/serializer.service';

import { UnknownUserGroupException } from '../../../exceptions';

@Injectable()
export class GroupReqMapper {
  constructor(
    private readonly serializer: Serializer,
    @Inject('REDIS') private readonly redis: Redis,
  ) {}

  async toUserGroup(
    groupName: string,
    platformGroupId: string,
    axios: Axios,
    currencyIso: string | null = null,
    symbols: Mt5Group['symbols'] | null = null,
  ): Promise<Mt5Group> {
    // Get the base URL of the axios instance
    const url = axios.defaults.baseURL!;

    // Create a cache key
    const key = `{platforms}:cache:mt5:user-groups:${Cryptography.hashMd5(url)}-${platformGroupId}`;

    // Fetch from cache
    const cached = await this.redis.get(key);
    let template: Mt5Group | null = this.serializer.unSerialize<Mt5Group>(cached);

    // Otherwise fetch from the server
    if (!template) {
      try {
        const { data } = await axios.get<Mt5Group>(`/groups/${platformGroupId}`);
        template = data;

        await this.redis.set(key, this.serializer.serialize(template));
      } catch {}
    }

    if (!template) {
      throw new UnknownUserGroupException(platformGroupId);
    }

    // Set the group details
    template.group = groupName;

    if (currencyIso) {
      template.currency = currencyIso;
    }
    if (symbols) {
      template.symbols = symbols;
    }

    return template;
  }
}
