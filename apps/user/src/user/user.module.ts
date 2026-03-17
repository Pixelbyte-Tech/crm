import { TypeOrmModule } from '@nestjs/typeorm';
import { Module, forwardRef } from '@nestjs/common';

import { UserEntity, CompanyEntity } from '@crm/database';

import { UserMapper } from './mappers';
import { UserService } from './services';
import { AuthModule } from '../auth/auth.module';
import { UserController } from './user.controller';
import { SessionModule } from './modules/session/session.module';

@Module({
  imports: [forwardRef(() => AuthModule), SessionModule, TypeOrmModule.forFeature([CompanyEntity, UserEntity])],
  providers: [UserMapper, UserService],
  controllers: [UserController],
  exports: [SessionModule, UserMapper, UserService],
})
export class UserModule {}
