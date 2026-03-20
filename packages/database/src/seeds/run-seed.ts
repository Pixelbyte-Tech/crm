import { NestFactory } from '@nestjs/core';

import { UserSeedService } from './services/user-seed.service';
import { CompanySeedService } from './services/company-seed.service';
import { OrganisationSeedService } from './services/organisation-seed.service';

import { SeedModule } from './seed.module';

const runSeed = async () => {
  const app = await NestFactory.create(SeedModule);
  await app.get(OrganisationSeedService).run();
  await app.get(CompanySeedService).run();
  await app.get(UserSeedService).run();

  await app.close();
};

void runSeed();
