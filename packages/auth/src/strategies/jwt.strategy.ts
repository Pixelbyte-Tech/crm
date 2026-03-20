import { Request } from 'express';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';

import { AuthStrategy } from '@crm/types';

import { UserJwtPayloadType } from '../types';
import { AuthModuleOptions } from '../auth.module';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, AuthStrategy.JWT) {
  constructor(@Inject('AUTH_CONFIG_OPTIONS') private readonly opts: AuthModuleOptions) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => request?.cookies?.['access-token'] || null,
        ExtractJwt.fromAuthHeaderAsBearerToken(), // Fallback to the Authorization header for backward compatibility
      ]),
      secretOrKey: opts.jwtSecret,
    });
  }

  // Why we don't check if the user exists in the database:
  // https://github.com/brocoders/nestjs-boilerplate/blob/main/docs/auth.md#about-jwt-strategy
  public validate(payload: UserJwtPayloadType): UserJwtPayloadType | never {
    if (!payload?.userId) {
      throw new UnauthorizedException();
    }

    return payload;
  }
}
