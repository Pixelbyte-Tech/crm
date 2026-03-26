import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TagSeedService } from './services/tag-seed.service';
import { UserSeedService } from './services/user-seed.service';
import { ServerSeedService } from './services/server-seed.service';
import { UserNoteSeedService } from './services/user-note-seed.service';
import { IntegrationSeedService } from './services/integration-seed.service';
import { GlobalSettingSeedService } from './services/global-setting-seed.service';
import { PlatformClientSeedService } from './services/platform-client-seed.service';
import { TradingAccountSchemaSeedService } from './services/trading-account-schema-seed.service';

import { TagEntity } from '../entities/tag.entity';
import { UserEntity } from '../entities/user.entity';
import { ServerEntity } from '../entities/server.entity';
import { UserNoteEntity } from '../entities/user-note.entity';
import { IntegrationEntity } from '../entities/integration.entity';
import { GlobalSettingEntity } from '../entities/global-setting.entity';
import { PlatformClientEntity } from '../entities/platform-client.entity';
import { TradingAccountSchemaEntity } from '../entities/trading-account-schema.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DATABASE_HOST,
        port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
        username: process.env.DATABASE_USERNAME,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
        entities: [__dirname + '/../entities/**/*.entity{.ts,.js}'],
      }),
    }),
    TypeOrmModule.forFeature([
      GlobalSettingEntity,
      IntegrationEntity,
      PlatformClientEntity,
      ServerEntity,
      TagEntity,
      TradingAccountSchemaEntity,
      UserEntity,
      UserNoteEntity,
    ]),
  ],
  providers: [
    GlobalSettingSeedService,
    IntegrationSeedService,
    PlatformClientSeedService,
    ServerSeedService,
    TagSeedService,
    TradingAccountSchemaSeedService,
    UserSeedService,
    UserNoteSeedService,
  ],
})
export class SeedModule {}
