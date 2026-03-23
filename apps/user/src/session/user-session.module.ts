import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserAuthSessionEntity } from '@crm/database';

import { UserSessionMapper } from './mappers';
import { UserSessionService } from './services';
import { UserSessionController } from './user-session.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserAuthSessionEntity])],
  providers: [UserSessionMapper, UserSessionService],
  controllers: [UserSessionController],
  exports: [UserSessionMapper, UserSessionService],
})
export class UserSessionModule {}
