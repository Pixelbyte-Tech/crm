import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PlatformClientEntity } from '@crm/database';

import { PlatformClientMapper } from './mappers';
import { PlatformClientService } from './services';
import { ServerModule } from '../server/server.module';
import { PlatformClientController } from './platform-client.controller';

@Module({
  imports: [ServerModule, TypeOrmModule.forFeature([PlatformClientEntity])],
  providers: [PlatformClientMapper, PlatformClientService],
  controllers: [PlatformClientController],
})
export class PlatformClientModule {}
