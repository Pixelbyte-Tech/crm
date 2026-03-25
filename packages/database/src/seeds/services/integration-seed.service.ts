import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Logger, Injectable } from '@nestjs/common';

import { IntegrationType } from '@crm/types';

import { TRADING_INTEGRATIONS } from '../helper/seed-ids';
import { IntegrationEntity } from '../../entities/integration.entity';

@Injectable()
export class IntegrationSeedService {
  constructor(@InjectRepository(IntegrationEntity) private repo: Repository<IntegrationEntity>) {}

  readonly #logger = new Logger(this.constructor.name);

  async run() {
    this.#logger.log('Starting integrations seed...');

    try {
      for (const name of TRADING_INTEGRATIONS) {
        if ((await this.repo.count({ where: { name } })) !== 0) {
          continue;
        }

        const entity = new IntegrationEntity();
        entity.type = IntegrationType.TRADING_PLATFORM;
        entity.name = name;
        entity.priority = 0;
        entity.isEnabled = true;
        entity.allowedCountries = ['MT', 'GB'];
        entity.settings = {};

        await this.repo.save(entity);
        this.#logger.debug(` -> Seeded integration '${name}'`);
      }

      this.#logger.log('✅ Integrations seeded successfully');
    } catch (err) {
      this.#logger.error(`Error seeding integrations`, err);
      throw err;
    }
  }
}
