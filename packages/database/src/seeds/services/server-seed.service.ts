import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Logger, Injectable } from '@nestjs/common';

import { Monetisation } from '@crm/types';

import { toPlatform } from '../helper/to-platform';
import { ServerEntity } from '../../entities/server.entity';
import { IntegrationEntity } from '../../entities/integration.entity';

@Injectable()
export class ServerSeedService {
  constructor(
    @InjectRepository(ServerEntity) private repo: Repository<ServerEntity>,
    @InjectRepository(IntegrationEntity) private integrationRepo: Repository<IntegrationEntity>,
  ) {}

  readonly #logger = new Logger(this.constructor.name);

  async run() {
    this.#logger.log('Starting servers seed...');

    const integrations = await this.integrationRepo.find();
    try {
      for (const integration of integrations) {
        if ((await this.repo.count({ where: { integrationId: integration.id } })) !== 0) {
          continue;
        }

        const entity = new ServerEntity();
        entity.name = `Test Server ${integration.name}`;
        entity.integrationId = integration.id;
        entity.platform = toPlatform(integration.name);
        entity.isEnabled = true;
        entity.monetisation = Monetisation.DEMO;
        entity.settings = {};
        entity.timezone = 'utc';
        entity.offsetHours = 0;

        await this.repo.save(entity);
        this.#logger.log(` -> Seeded server for '${integration.name}'`);
      }

      this.#logger.log('✅ Servers seeded successfully');
    } catch (err) {
      this.#logger.error(`Error seeding servers`, err);
      throw err;
    }
  }
}
