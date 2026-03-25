import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Logger, Injectable } from '@nestjs/common';

import { GlobalSettingKey } from '@crm/types';

import { GlobalSettingEntity } from '../../entities/global-setting.entity';

@Injectable()
export class GlobalSettingSeedService {
  constructor(@InjectRepository(GlobalSettingEntity) private repo: Repository<GlobalSettingEntity>) {}

  readonly #logger = new Logger(this.constructor.name);

  async run() {
    this.#logger.log('Starting global settings seed');

    const settings: Map<GlobalSettingKey, unknown> = new Map();
    settings.set(GlobalSettingKey.COMPANY_NAME, 'Test Company');
    settings.set(GlobalSettingKey.USER_CAN_DEPOSIT, true);
    settings.set(GlobalSettingKey.USER_CAN_WITHDRAW, true);
    settings.set(GlobalSettingKey.USER_CAN_AUTO_WITHDRAW, false);
    settings.set(GlobalSettingKey.USER_MAX_AUTO_WITHDRAW_AMT, 10000);

    const items: GlobalSettingEntity[] = [];

    try {
      const existing = await this.repo.find();

      // Process any missing settings
      for (const [key, value] of Object.entries(settings)) {
        if (!existing.some((e) => e.key === key)) {
          const entity = new GlobalSettingEntity();
          entity.key = key as GlobalSettingKey;
          entity.value = value;
          items.push(entity);
        }
      }

      if (items.length) {
        await this.repo.save(items);
        this.#logger.log(`Seeded global settings`);
      }
    } catch (err) {
      this.#logger.error(`Error seeding global settings`, err);
      throw err;
    }
  }
}
