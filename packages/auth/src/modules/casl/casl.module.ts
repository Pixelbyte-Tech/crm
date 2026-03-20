import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CanGuard } from './guards';
import { SubjectFactory, CaslAbilityFactory } from './factories';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature()],
  providers: [CanGuard, CaslAbilityFactory, SubjectFactory],
  exports: [CanGuard, SubjectFactory],
})
export class CaslModule {}
