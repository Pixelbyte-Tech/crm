import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserAuthSessionEntity } from '@crm/database';

import { UserSessionMapper } from './mappers';
import { UserSessionService } from './services';
import { SessionController } from './session.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserAuthSessionEntity])],
  providers: [UserSessionMapper, UserSessionService],
  controllers: [SessionController],
  exports: [UserSessionMapper, UserSessionService],
})
export class SessionModule {}
