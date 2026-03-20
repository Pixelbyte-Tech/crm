import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { CompanySettingEntity } from '@crm/database';
import { CompanySetting, CompanySettingKey } from '@crm/types';

import { CompanySettingMapper } from '../mappers';

@Injectable()
export class CompanySettingService {
  constructor(
    private readonly companySettingMapper: CompanySettingMapper,
    @InjectRepository(CompanySettingEntity)
    private readonly repo: Repository<CompanySettingEntity>,
  ) {}

  /**
   * Returns a specific setting for a specific company
   * @param companyId The id of the company to fetch the setting for
   * @param key The setting key to fetch
   */
  async fetchOne(companyId: string, key: CompanySettingKey): Promise<undefined | CompanySetting> {
    const record = await this.repo.findOne({ where: { companyId, key } });
    if (record) {
      return this.companySettingMapper.toSetting(record);
    }
  }

  /**
   * Returns all settings for a specific company
   * @param companyId The id of the company to fetch the settings for
   */
  async fetch(companyId: string): Promise<CompanySetting[]> {
    const records = await this.repo.find({ where: { companyId } });

    const results: CompanySetting[] = [];
    for (const record of records) {
      results.push(this.companySettingMapper.toSetting(record));
    }

    return results;
  }
}
