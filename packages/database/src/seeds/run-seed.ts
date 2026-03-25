import { NestFactory } from '@nestjs/core';

import { TagSeedService } from './services/tag-seed.service';
import { UserSeedService } from './services/user-seed.service';
import { ServerSeedService } from './services/server-seed.service';
import { UserNoteSeedService } from './services/user-note-seed.service';
import { IntegrationSeedService } from './services/integration-seed.service';
import { GlobalSettingSeedService } from './services/global-setting-seed.service';
import { PlatformClientSeedService } from './services/platform-client-seed.service';

import { SeedModule } from './seed.module';

const runSeed = async () => {
  const app = await NestFactory.create(SeedModule);
  await app.get(GlobalSettingSeedService).run();
  await app.get(IntegrationSeedService).run();
  await app.get(ServerSeedService).run();
  await app.get(PlatformClientSeedService).run();
  await app.get(TagSeedService).run();
  await app.get(UserSeedService).run();
  await app.get(UserNoteSeedService).run();

  await app.close();
};

void runSeed();
