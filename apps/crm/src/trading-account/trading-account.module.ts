import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ServerEntity, TradingAccountEntity } from '@crm/database';

import { TradingAccountService } from './services';
import { TagModule } from './modules/tag/tag.module';
import { SchemaModule } from './modules/schema/schema.module';
import { TradingAccountController } from './trading-account.controller';
import { BalanceMapper, UserGroupMapper, TradingAccountMapper } from './mappers';

@Module({
  imports: [TagModule, SchemaModule, TypeOrmModule.forFeature([ServerEntity, TradingAccountEntity])],
  providers: [BalanceMapper, TradingAccountMapper, TradingAccountService, UserGroupMapper],
  controllers: [TradingAccountController],
})
export class TradingAccountModule {}
