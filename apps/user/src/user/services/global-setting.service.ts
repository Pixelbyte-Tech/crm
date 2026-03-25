import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { GlobalSettingEntity } from '@crm/database';
import { GlobalSetting, UserSettingKey } from '@crm/types';

import { GlobalSettingMapper } from '../mappers';

@Injectable()
export class GlobalSettingService {
  constructor(
    private readonly globalSettingMapper: GlobalSettingMapper,
    @InjectRepository(GlobalSettingEntity)
    private readonly repo: Repository<GlobalSettingEntity>,
  ) {}

  /**
   * Returns a specific global setting
   * @param key The setting key to fetch
   */
  async fetchOne(key: UserSettingKey): Promise<undefined | GlobalSetting> {
    const record = await this.repo.findOne({ where: { key } });
    if (record) {
      return this.globalSettingMapper.toSetting(record);
    }
  }

  /**
   * Returns all global settings
   */
  async fetch(): Promise<GlobalSetting[]> {
    const records = await this.repo.find();

    const results: GlobalSetting[] = [];
    for (const record of records) {
      results.push(this.globalSettingMapper.toSetting(record));
    }

    return results;
  }
}
