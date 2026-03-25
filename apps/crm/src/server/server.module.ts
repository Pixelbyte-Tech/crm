import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ServerEntity } from '@crm/database';

import { ServerMapper } from './mappers';
import { ServerService } from './services';
import { ServerController } from './server.controller';
import { IntegrationModule } from '../integration/integration.module';

@Module({
  imports: [IntegrationModule, TypeOrmModule.forFeature([ServerEntity])],
  providers: [ServerMapper, ServerService],
  controllers: [ServerController],
  exports: [ServerService],
})
export class ServerModule {}
