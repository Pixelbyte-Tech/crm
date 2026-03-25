import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IntegrationEntity } from '@crm/database';

import { IntegrationMapper } from './mappers';
import { IntegrationService } from './services';
import { IntegrationController } from './integration.controller';

@Module({
  imports: [TypeOrmModule.forFeature([IntegrationEntity])],
  providers: [IntegrationMapper, IntegrationService],
  controllers: [IntegrationController],
})
export class IntegrationModule {}
