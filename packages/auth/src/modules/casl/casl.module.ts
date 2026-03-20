import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserEntity } from '@crm/database';

import { SubjectFactory, CaslAbilityFactory } from './factories';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  providers: [CaslAbilityFactory, SubjectFactory],
})
export class CaslModule {}
