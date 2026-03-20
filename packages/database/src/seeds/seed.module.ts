import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserSeedService } from './services/user-seed.service';
import { CompanySeedService } from './services/company-seed.service';
import { OrganisationSeedService } from './services/organisation-seed.service';

import { UserEntity } from '../entities/user.entity';
import { CompanyEntity } from '../entities/company.entity';
import { UserCompanyEntity } from '../entities/user-company.entity';
import { OrganisationEntity } from '../entities/organisation.entity';

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
    TypeOrmModule.forFeature([CompanyEntity, OrganisationEntity, UserCompanyEntity, UserEntity]),
  ],
  providers: [CompanySeedService, OrganisationSeedService, UserSeedService],
})
export class SeedModule {}
