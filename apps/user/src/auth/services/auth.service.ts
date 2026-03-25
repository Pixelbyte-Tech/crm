import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { DateTime, Duration } from 'luxon';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Logger,
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
  InternalServerErrorException,
} from '@nestjs/common';

import { Cryptography } from '@crm/utils';
import { UserEntity } from '@crm/database';
import { JwtRefreshPayloadType } from '@crm/auth';
import { User, Role, AuthSessionStatus } from '@crm/types';

import { Token } from '../types';
import { EmailLoginDto } from '../dto/in';
import { UserLoginResDto } from '../dto/out';
import { UserMapper } from '../../user/mappers';
import { AuthConfig } from '../config/auth-config.type';
import { UserSessionService } from '../../session/services';
import { InvitationService } from '../../invitation/services';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userMapper: UserMapper,
    private readonly invitationService: InvitationService,
    private readonly userSessionService: UserSessionService,
    private readonly configService: ConfigService<{ auth: AuthConfig }>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  readonly #logger: Logger = new Logger(this.constructor.name);

  /**
   * Returns the user object for the provided user id
   * @param userId The user id
   */
  async me(userId: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException();
    }

    return this.userMapper.toUser(user);
  }
  /**
   * Authenticates a user using their email and password. If successful, the JWT tokens are returned.
   * @param dto The login dto
   * @param ip The ip address of the user
   * @param userAgent The user agent pf the user
   */
  async authenticate(dto: EmailLoginDto, ip?: string, userAgent?: string): Promise<UserLoginResDto> {
    const msg = `User ${dto.email} attempting to login`;

    // Check if the user exists and the password is correct
    const user = await this.userRepo.findOne({
      relations: { detail: true, settings: true },
      where: { email: dto.email, passwordHash: Cryptography.hash(dto.password) },
    });

    if (!user) {
      this.#logger.warn(`${msg} - Failed: invalid credentials`);
      throw new UnprocessableEntityException('Invalid email or password');
    }

    // Generate a random hash for the session
    const str = `${dto.email}${DateTime.utc().toMillis().toString()}`;
    const randomHash = Cryptography.hash(str);

    // Accept invitation if token provided (also assigns roles)
    if (dto.invitationToken) {
      await this.invitationService.accept(dto.invitationToken);
    }

    try {
      // Create a new auth session for the user
      const session = await this.userSessionService.create({
        userId: user.id,
        hash: randomHash,
        ipAddress: ip,
        userAgent,
      });

      // Generate JWT tokens for the user
      const tokens = await this.#generateTokens(user.id, session.id, randomHash, user.roles);
      const result = { user: this.userMapper.toUser(user), tokens };

      // Update the session status
      await this.userSessionService.update(session.id, { status: AuthSessionStatus.COMPLETE });

      return result;
    } catch (err) {
      this.#logger.error(`${msg} - Failed: generate session and tokens`, err);
      throw err;
    }
  }

  /**
   * Refreshes JWT tokens using a refresh token payload
   * @param data The refresh token payload
   */
  async refreshToken(data: Pick<JwtRefreshPayloadType, 'sessionId' | 'hash'>): Promise<UserLoginResDto> {
    const msg = `Refreshing session ${data.sessionId}`;

    // Fetch the session
    const session = await this.userSessionService.get(data.sessionId);
    if (!session || session.hash !== data.hash) {
      throw new UnauthorizedException();
    }

    // Fetch the user
    const user = await this.userRepo.findOne({ where: { id: session.userId } });
    if (!user) {
      throw new UnauthorizedException();
    }

    // Generate a random hash for the session
    const str = `${user.email}${DateTime.utc().toMillis().toString()}`;
    const randomHash = Cryptography.hash(str);

    try {
      // Update the auth session for the user
      await this.userSessionService.update(session.id, { hash: randomHash });

      // Generate JWT tokens for the user
      const result = await this.#generateTokens(user.id, session.id, randomHash, user.roles);
      return { user: this.userMapper.toUser(user), tokens: result };
    } catch (err) {
      this.#logger.error(`${msg} - Failed: generate session and tokens`, err);
      throw err;
    }
  }

  /**
   * Verifies the user's email address
   * @param token The required email confirmation token
   */
  async verifyEmail(token: string): Promise<boolean> {
    const msg = `Confirming email with token`;
    this.#logger.log(`${msg} - Start`);

    let userId: string;

    try {
      const jwtData = await this.jwtService.verifyAsync<{ userId: string }>(token, {
        secret: this.configService.getOrThrow('auth.confirmEmailSecret', { infer: true }),
      });

      userId = jwtData.userId;
      this.#logger.log(`${msg}. UserId: ${userId} - Verified token`);
    } catch {
      throw new UnprocessableEntityException('Invalid or expired confirmation token');
    }

    try {
      const result = await this.userRepo.update(userId, { isEmailVerified: true });
      this.#logger.log(`${msg} - Complete`);

      return (result.affected ?? 0) > 0;
    } catch (err) {
      this.#logger.error(`${msg} - Failed`, err);
      throw new InternalServerErrorException('Failed to update user email confirmation status', { cause: err });
    }
  }

  /**
   * Resets the user's password
   * @param token The required email confirmation token
   * @param password The new password to set
   */
  async resetPassword(token: string, password: string): Promise<boolean> {
    const msg = `Resetting password with token`;
    this.#logger.log(`${msg} - Start`);

    let userId: string;

    try {
      const jwtData = await this.jwtService.verifyAsync<{ userId: string }>(token, {
        secret: this.configService.getOrThrow('auth.forgotSecret', { infer: true }),
      });

      userId = jwtData.userId;
      this.#logger.log(`${msg}. UserId: ${userId} - Verified token`);
    } catch {
      throw new UnprocessableEntityException('Invalid or expired confirmation token');
    }

    try {
      await this.userRepo.update(userId, { passwordHash: Cryptography.hash(password) });
      this.#logger.log(`${msg} - Complete`);

      return true;
    } catch (err) {
      this.#logger.error(`${msg} - Failed`, err);
      throw new InternalServerErrorException('Failed to update user email', { cause: err });
    }
  }

  /**
   * Generates an email confirmation token for the user
   * @param userId The user id
   */
  async generateEmailConfirmationToken(userId: string): Promise<Token> {
    const tokenExpiresIn = this.configService.getOrThrow('auth.confirmEmailExpires', { infer: true });

    const tokenExpires = DateTime.utc().plus(Duration.fromISO(tokenExpiresIn));
    const tokenExpireMs = tokenExpires.diff(DateTime.utc()).toMillis();

    const token = await this.jwtService.signAsync(
      { userId },
      {
        secret: this.configService.getOrThrow('auth.confirmEmailSecret', { infer: true }),
        expiresIn: Math.round(tokenExpireMs / 1000),
      },
    );

    return { token, expireMs: tokenExpireMs };
  }

  /**
   * Generates a password reset token for the user
   * @param userId The user id
   */
  async generatePasswordResetToken(userId: string): Promise<Token> {
    const tokenExpiresIn = this.configService.getOrThrow('auth.forgotExpires', { infer: true });

    const tokenExpires = DateTime.utc().plus(Duration.fromISO(tokenExpiresIn));
    const tokenExpireMs = tokenExpires.diff(DateTime.utc()).toMillis();

    const token = await this.jwtService.signAsync(
      { userId },
      {
        secret: this.configService.getOrThrow('auth.forgotSecret', { infer: true }),
        expiresIn: Math.round(tokenExpireMs / 1000),
      },
    );

    return { token, expireMs: tokenExpireMs };
  }

  /**
   * Generates JWT tokens for the user
   * @param userId The user id
   * @param sessionId The session id
   * @param randomHash A random hash
   * @param roles
   * @returns {Promise<Token>} The generated tokens
   */
  async #generateTokens(
    userId: string,
    sessionId: string,
    randomHash: string,
    roles: Role[],
  ): Promise<{ auth: Token; refresh: Token }> {
    const tokenExpiresIn = this.configService.getOrThrow('auth.expires', { infer: true });
    const refreshExpiresIn = this.configService.getOrThrow('auth.refreshExpires', { infer: true });

    const tokenExpires = DateTime.utc().plus(Duration.fromISO(tokenExpiresIn));
    const tokenExpireMs = tokenExpires.diff(DateTime.utc()).toMillis();

    const refreshExpires = DateTime.utc().plus(Duration.fromISO(refreshExpiresIn));
    const refreshExpireMs = refreshExpires.diff(DateTime.utc()).toMillis();

    const [token, refreshToken] = await Promise.all([
      await this.jwtService.signAsync(
        { userId, sessionId, roles },
        {
          secret: this.configService.getOrThrow('auth.secret', { infer: true }),
          expiresIn: Math.round(tokenExpireMs / 1000),
        },
      ),
      await this.jwtService.signAsync(
        { sessionId, hash: randomHash },
        {
          secret: this.configService.getOrThrow('auth.refreshSecret', { infer: true }),
          expiresIn: Math.round(refreshExpireMs / 1000),
        },
      ),
    ]);

    return { auth: { token, expireMs: tokenExpireMs }, refresh: { token: refreshToken, expireMs: refreshExpireMs } };
  }
}
