import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ServerEntity, TradingAccountSchemaEntity, TradingAccountSchemaLeverageEntity } from '@crm/database';

import { SchemaMapper } from './mappers';
import { SchemaService } from './services';
import { SchemaController } from './schema.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ServerEntity, TradingAccountSchemaEntity, TradingAccountSchemaLeverageEntity])],
  providers: [SchemaMapper, SchemaService],
  controllers: [SchemaController],
})
export class SchemaModule {}
