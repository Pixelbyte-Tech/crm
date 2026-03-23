import { TypeOrmModule } from '@nestjs/typeorm';
import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { UserEntity } from '@crm/database';
import { AuthModule as CommonAuthModule } from '@crm/auth';

import authConfig from './config/auth.config';

import { AuthService } from './services';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthConfig } from './config/auth-config.type';
import { InvitationModule } from '../invitation/invitation.module';
import { UserSessionModule } from '../session/user-session.module';

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
    InvitationModule,
    forwardRef(() => UserModule),
    UserSessionModule,
    TypeOrmModule.forFeature([UserEntity]),
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
