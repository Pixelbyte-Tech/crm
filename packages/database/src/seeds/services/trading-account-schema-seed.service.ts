import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Logger, Injectable } from '@nestjs/common';

import { ServerEntity } from '../../entities/server.entity';
import { TradingAccountSchemaEntity } from '../../entities/trading-account-schema.entity';

@Injectable()
export class TradingAccountSchemaSeedService {
  constructor(
    @InjectRepository(ServerEntity) private serverRepo: Repository<ServerEntity>,
    @InjectRepository(TradingAccountSchemaEntity) private repo: Repository<TradingAccountSchemaEntity>,
  ) {}

  readonly #logger = new Logger(this.constructor.name);

  async run() {
    this.#logger.log('Starting schemas seed...');

    const servers = await this.serverRepo.find();
    try {
      for (const server of servers) {
        if ((await this.repo.count({ where: { serverId: server.id } })) !== 0) {
          continue;
        }

        await this.repo.save({
          name: `Test Client ${server.name}`,
          description: 'Test Client description',
          serverId: server.id,
          platformUserGroupId: 'n/a',
          allowedLeverages: [1, 10, 100],
          allowedCurrencies: ['BTC', 'EUR', 'USD'],
          allowedCountries: ['MT', 'GB'],
          isEnabled: true,
          isKycRequired: true,
          maxAccountsPerUser: 10,
          minDepositAmountUsd: 10,
          maxDepositAmountUsd: 10_000,
          leverageOverwrites: [
            {
              leverages: [5, 50],
              allowedCountries: ['MT'],
            },
          ],
        });

        this.#logger.debug(` -> Seeded schema for '${server.name}'`);
      }

      this.#logger.log('✅ Schemas seeded successfully');
    } catch (err) {
      this.#logger.error(`Error seeding schema`, err);
      throw err;
    }
  }
}
