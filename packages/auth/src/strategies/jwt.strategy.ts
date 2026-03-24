import { Request } from 'express';
import * as Sentry from '@sentry/nestjs';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';

import { AuthStrategy } from '@crm/types';

import { AuthModuleOptions } from '../auth.module';
import { AuthenticatedReq, UserJwtPayloadType } from '../types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, AuthStrategy.JWT) {
  constructor(@Inject('AUTH_CONFIG_OPTIONS') private readonly opts: AuthModuleOptions) {
    super({
      passReqToCallback: true,
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => request?.cookies?.['access-token'] || null,
        ExtractJwt.fromAuthHeaderAsBearerToken(), // Fallback to the Authorization header for backward compatibility
      ]),
      secretOrKey: opts.jwtSecret,
    });
  }

  // Why we don't check if the user exists in the database:
  // https://github.com/brocoders/nestjs-boilerplate/blob/main/docs/auth.md#about-jwt-strategy
  public validate(req: Request, payload: UserJwtPayloadType): AuthenticatedReq['user'] | never {
    if (!payload?.userId) {
      throw new UnauthorizedException();
    }

    // Find the trace id if present
    let traceId: string | undefined;
    const span = Sentry.getActiveSpan();
    if (span) {
      traceId = span.spanContext().traceId;
    }

    return {
      userId: payload.userId,
      sessionId: payload.sessionId,
      roles: payload.roles,
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
      traceId,
    };
  }
}
