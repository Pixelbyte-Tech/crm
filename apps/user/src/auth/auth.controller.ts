import { DateTime } from 'luxon';
import { ApiTags, ApiExtraModels } from '@nestjs/swagger';
import { Req, Get, Body, Post, Response, Controller } from '@nestjs/common';
import { Request as ExpressRequest, Response as ExpressResponse } from 'express';

import { Env } from '@crm/utils';
import { OpenApi } from '@crm/swagger';
import { User, AuthStrategy } from '@crm/types';
import { Auth, RefreshReq, AuthenticatedReq } from '@crm/auth';

import { AuthService } from './services';
import { UserLoginResDto } from './dto/out';
import { InvitationService } from '../user/modules/invitation/services';
import { EmailLoginDto, ConfirmEmailDto, ResetPasswordDto, ForgotPasswordDto, RejectInvitationDto } from './dto/in';

@ApiTags('Auth')
@ApiExtraModels(EmailLoginDto, ConfirmEmailDto, ResetPasswordDto, ForgotPasswordDto)
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly invitationService: InvitationService,
  ) {}

  /**
   * Returns the authenticated user information
   * @param req The authenticated request object
   */
  @Auth()
  @OpenApi({ type: User })
  @Get('me')
  async me(@Req() req: AuthenticatedReq): Promise<{ data: User }> {
    return { data: await this.authService.me(req.user.userId) };
  }

  /**
   * Login with email and password
   * @param dto The dto payload
   * @param req The request object
   * @param response The response object
   */
  @OpenApi({ type: UserLoginResDto })
  @Post('login')
  public async login(
    @Body() dto: EmailLoginDto,
    @Req() req: ExpressRequest,
    @Response({ passthrough: true }) response: ExpressResponse,
  ): Promise<{ data: UserLoginResDto }> {
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
  @OpenApi({ type: UserLoginResDto })
  @Post('refresh')
  public async refresh(
    @Req() req: RefreshReq,
    @Response({ passthrough: true }) response: ExpressResponse,
  ): Promise<{ data: UserLoginResDto }> {
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
   * @param dto The dto payload
   */
  @OpenApi()
  @Post('confirm-email')
  public async confirmEmail(@Body() dto: ConfirmEmailDto): Promise<void> {
    await this.authService.verifyEmail(dto.token);
  }

  /**
   * Resets the user's password using the token sent to their email address and the new password
   * @param dto The dto payload
   */
  @OpenApi()
  @Post('reset-password')
  public async resetPassword(@Body() dto: ResetPasswordDto): Promise<void> {
    await this.authService.resetPassword(dto.token, dto.password);
  }

  /**
   * Rejects an invitation for an email address to join
   * @param dto The dto payload
   */
  @OpenApi()
  @Post('reject-invitation')
  public async rejectInvitation(@Body() dto: RejectInvitationDto): Promise<void> {
    await this.invitationService.reject(dto.token);
  }
}
