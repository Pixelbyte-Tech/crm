import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GlobalSettingEntity } from '@crm/database';

import { GlobalSettingMapper } from './mappers';
import { GlobalSettingService } from './services';
import { GlobalSettingController } from './global-setting.controller';

@Module({
  imports: [TypeOrmModule.forFeature([GlobalSettingEntity])],
  providers: [GlobalSettingMapper, GlobalSettingService],
  controllers: [GlobalSettingController],
})
export class GlobalSettingModule {}
