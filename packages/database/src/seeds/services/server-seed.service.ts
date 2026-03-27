import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Logger, Injectable } from '@nestjs/common';

import { Platform, Monetisation, DxServerSettingsDto, TlServerSettingsDto, Mt5ServerSettingsDto } from '@crm/types';

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

        // Create the settings for the server based on the platform
        let settings: any = {};
        const platform = toPlatform(integration.name);
        switch (platform) {
          case Platform.DX:
            settings = new DxServerSettingsDto();
            settings.host = 'https://swaymarketstage.prosp.devexperts.com';
            settings.username = 'demo_1';
            settings.password = 'test';
            settings.domain = 'default';
            break;
          case Platform.MT5:
            settings = new Mt5ServerSettingsDto();
            settings.host = '100.51.9.103';
            settings.username = 'demo_1'; //todo update
            settings.password = 'test'; //todo update
            break;
          case Platform.TL:
            settings = new TlServerSettingsDto();
            break;
        }

        const entity = new ServerEntity();
        entity.name = `Test Server ${integration.name}`;
        entity.integrationId = integration.id;
        entity.platform = platform;
        entity.isEnabled = true;
        entity.monetisation = Monetisation.DEMO;
        entity.settings = settings;
        entity.timezone = 'utc';
        entity.offsetHours = 0;

        await this.repo.save(entity);
        this.#logger.debug(` -> Seeded server for '${integration.name}'`);
      }

      this.#logger.log('✅ Servers seeded successfully');
    } catch (err) {
      this.#logger.error(`Error seeding servers`, err);
      throw err;
    }
  }
}
