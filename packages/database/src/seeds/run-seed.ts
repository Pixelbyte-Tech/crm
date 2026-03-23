import { NestFactory } from '@nestjs/core';

import { UserSeedService } from './services/user-seed.service';
import { GlobalSettingSeedService } from './services/global-setting-seed.service';

import { SeedModule } from './seed.module';

const runSeed = async () => {
  const app = await NestFactory.create(SeedModule);
  await app.get(GlobalSettingSeedService).run();
  await app.get(UserSeedService).run();

  await app.close();
};

void runSeed();
