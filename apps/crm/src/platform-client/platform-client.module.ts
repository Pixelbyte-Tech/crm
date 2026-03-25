import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PlatformClientEntity } from '@crm/database';

import { PlatformClientMapper } from './mappers';
import { PlatformClientService } from './services';
import { PlatformClientController } from './platform-client.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PlatformClientEntity])],
  providers: [PlatformClientMapper, PlatformClientService],
  controllers: [PlatformClientController],
})
export class PlatformClientModule {}
