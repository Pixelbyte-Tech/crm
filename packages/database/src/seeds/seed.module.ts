import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserSeedService } from './services/user-seed.service';
import { GlobalSettingSeedService } from './services/global-setting-seed.service';

import { UserEntity } from '../entities/user.entity';
import { GlobalSettingEntity } from '../entities/global-setting.entity';

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
    TypeOrmModule.forFeature([GlobalSettingEntity, UserEntity]),
  ],
  providers: [GlobalSettingSeedService, UserSeedService],
})
export class SeedModule {}
