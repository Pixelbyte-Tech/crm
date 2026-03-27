import { Module } from '@nestjs/common';

import { PlatformServerFactory } from './services';

@Module({
  providers: [PlatformServerFactory],
  exports: [PlatformServerFactory],
})
export class CommonModule {}
