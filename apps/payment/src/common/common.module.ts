import { Global, Module } from '@nestjs/common';

import { PlatformServerFactory } from './services';

@Global()
@Module({
  providers: [PlatformServerFactory],
  exports: [PlatformServerFactory],
})
export class CommonModule {}
