import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Logger, Injectable } from '@nestjs/common';

import { ORGANISATION_NAME } from '../seed-ids';
import { OrganisationEntity } from '../../entities/organisation.entity';

@Injectable()
export class OrganisationSeedService {
  constructor(@InjectRepository(OrganisationEntity) private repo: Repository<OrganisationEntity>) {}

  readonly #logger = new Logger(this.constructor.name);

  async run() {
    this.#logger.log('Starting organisation seed');

    const org = new OrganisationEntity();

    try {
      const countBroker = await this.repo.count({ where: { name: ORGANISATION_NAME } });
      if (countBroker === 0) {
        org.name = ORGANISATION_NAME;

        await this.repo.save(org);
        this.#logger.log(`Seeded organisation '${ORGANISATION_NAME}'`);
      }
    } catch (err) {
      this.#logger.error(`Error seeding organisation`, err);
      throw err;
    }
  }
}
