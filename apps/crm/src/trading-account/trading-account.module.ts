import { Module } from '@nestjs/common';

import { TagModule } from './modules/tag/tag.module';
import { SchemaModule } from './modules/schema/schema.module';

@Module({
  imports: [TagModule, SchemaModule],
})
export class TradingAccountModule {}
