import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Logger, Injectable } from '@nestjs/common';

import { PlatformClientType } from '@crm/types';

import { toPlatform } from '../helper/to-platform';
import { TRADING_INTEGRATIONS } from '../helper/seed-ids';
import { PlatformClientEntity } from '../../entities/platform-client.entity';

@Injectable()
export class PlatformClientSeedService {
  constructor(@InjectRepository(PlatformClientEntity) private repo: Repository<PlatformClientEntity>) {}

  readonly #logger = new Logger(this.constructor.name);

  async run() {
    this.#logger.log('Starting platform clients seed...');

    try {
      for (const name of TRADING_INTEGRATIONS) {
        if ((await this.repo.count({ where: { platform: toPlatform(name) } })) !== 0) {
          continue;
        }

        for (const clientType of Object.values(PlatformClientType)) {
          const entity = new PlatformClientEntity();
          entity.platform = toPlatform(name);
          entity.type = clientType;
          entity.link = `https://example.com/${clientType}`;
          entity.settings = { sample: 'test', foo: 'bar' };

          await this.repo.save(entity);
          this.#logger.log(` -> Seeded ${name} platform client '${clientType}'`);
        }
      }

      this.#logger.log('✅ Platform clients seeded successfully');
    } catch (err) {
      this.#logger.error(`Error seeding platform clients`, err);
      throw err;
    }
  }
}
