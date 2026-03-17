import { DateTime } from 'luxon';
import { ApiTags, ApiExtraModels } from '@nestjs/swagger';
import { Req, Get, Body, Post, Response, Controller } from '@nestjs/common';
import { Request as ExpressRequest, Response as ExpressResponse } from 'express';

import { Env } from '@crm/utils';
import { OpenApi } from '@crm/swagger';
import { User, AuthStrategy } from '@crm/types';
import { Auth, RefreshReq, AuthenticatedReq } from '@crm/auth';

import { AuthService } from './services';
import { EmailLoginResDto } from './dto/out';
import { EmailLoginDto, ConfirmEmailDto, ResetPasswordDto, ForgotPasswordDto } from './dto/in';

@ApiTags('Auth')
@ApiExtraModels(EmailLoginDto, ConfirmEmailDto, ResetPasswordDto, ForgotPasswordDto)
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Returns the authenticated user information
   * @param req The authenticated request object
   */
  @OpenApi({ type: User })
  @Auth()
  @Get('me')
  async me(@Req() req: AuthenticatedReq): Promise<{ data: User }> {
    return { data: await this.authService.me(req.user.userId) };
  }

  /**
   * Login with email and password
   * @param dto The login dto
   * @param req The request object
   * @param response The response object
   */
  @OpenApi({ type: EmailLoginResDto })
  @Post('login')
  public async login(
    @Body() dto: EmailLoginDto,
    @Req() req: ExpressRequest,
    @Response({ passthrough: true }) response: ExpressResponse,
  ): Promise<{ data: EmailLoginResDto }> {
    // Authenticate the user
    const result = await this.authService.authenticate(dto, req.ip, req.get('user-agent'));

    // Set cookies for access token and refresh token
    response.cookie('access-token', result.tokens.auth.token, {
      httpOnly: true,
      secure: !Env.isDev(),
      sameSite: 'strict',
      maxAge: DateTime.fromMillis(result.tokens.refresh.expireMs).toMillis(),
    });

    response.cookie('refresh-token', result.tokens.refresh.token, {
      httpOnly: true,
      secure: !Env.isDev(),
      sameSite: 'strict',
      maxAge: DateTime.fromMillis(result.tokens.refresh.expireMs).toMillis(),
    });

    return { data: result };
  }

  /**
   * Refresh the JWT tokens
   * @param req The request object
   * @param response The response object
   */
  @Auth([AuthStrategy.JWT_REFRESH])
  @OpenApi({ type: EmailLoginResDto })
  @Post('refresh')
  public async refresh(
    @Req() req: RefreshReq,
    @Response({ passthrough: true }) response: ExpressResponse,
  ): Promise<{ data: EmailLoginResDto }> {
    // Authenticate the user
    const result = await this.authService.refreshToken({
      sessionId: req.user.sessionId,
      hash: req.user.hash,
    });

    // Set cookies for access token and refresh token
    response.cookie('access-token', result.tokens.auth.token, {
      httpOnly: true,
      secure: !Env.isDev(),
      sameSite: 'strict',
      maxAge: DateTime.fromMillis(result.tokens.auth.expireMs).toMillis(),
    });

    response.cookie('refresh-token', result.tokens.refresh.token, {
      httpOnly: true,
      secure: !Env.isDev(),
      sameSite: 'strict',
      maxAge: DateTime.fromMillis(result.tokens.refresh.expireMs).toMillis(),
    });

    return { data: result };
  }

  /**
   * Confirms the user's email address
   * @param dto The confirm email dto
   */
  @OpenApi()
  @Post('confirm-email')
  public async confirmEmail(@Body() dto: ConfirmEmailDto): Promise<void> {
    await this.authService.verifyEmail(dto.token);
  }

  /**
   * Sends a password reset email to the user
   * @param dto The forgot password dto
   */
  @OpenApi()
  @Post('forgot-password')
  public async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<void> {
    await this.authService.forgotPassword(dto.email);
  }

  /**
   * Resets the user's password
   * @param dto The password reset dto
   */
  @OpenApi()
  @Post('reset-password')
  public async resetPassword(@Body() dto: ResetPasswordDto): Promise<void> {
    await this.authService.resetPassword(dto.token, dto.password);
  }
}
