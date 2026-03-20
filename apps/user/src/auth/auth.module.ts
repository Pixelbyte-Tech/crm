import { TypeOrmModule } from '@nestjs/typeorm';
import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthModule as CommonAuthModule } from '@crm/auth';
import { UserEntity, UserCompanyEntity } from '@crm/database';

import authConfig from './config/auth.config';

import { AuthService } from './services';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthConfig } from './config/auth-config.type';

@Module({
  imports: [
    CommonAuthModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (c: ConfigService<{ auth: AuthConfig }>) => ({
        jwtSecret: c.getOrThrow<string>('auth.secret', { infer: true }),
        refreshSecret: c.getOrThrow<string>('auth.refreshSecret', { infer: true }),
      }),
    }),
    ConfigModule.forFeature(authConfig),
    TypeOrmModule.forFeature([UserCompanyEntity, UserEntity]),
    forwardRef(() => UserModule),
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
