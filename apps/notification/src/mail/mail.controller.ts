import { ApiTags } from '@nestjs/swagger';
import { Post, Param, Controller } from '@nestjs/common';

import { Auth } from '@crm/auth';
import { OpenApi } from '@crm/swagger';
import { UserIdValidator } from '@crm/validation';

import { MailService } from './services';
import { UserService } from '../user/services';
import { AuthService } from '../auth/services';

@ApiTags('User')
@Controller({ path: 'users', version: '1' })
export class MailController {
  constructor(
    private readonly service: MailService,
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  /**
   * Sends a confirmation email to user by id
   * @param userId The user id to contact
   */
  @Auth()
  @OpenApi()
  @Post(':userId/notifications/confirm-email')
  public async sendConfirmEmail(@Param('userId', UserIdValidator) userId: string): Promise<void> {
    const user = await this.userService.get(userId);
    const token = await this.authService.generateEmailConfirmationToken(user.id);
    await this.service.sendConfirmEmail(user.email, token.token, user.firstName);
  }

  /**
   * Sends a password reset email to user by id
   * @param userId The user id to contact
   */
  @OpenApi()
  @Post(':userId/notifications/reset-password')
  public async sendResetPassword(@Param('userId', UserIdValidator) userId: string): Promise<void> {
    const user = await this.userService.get(userId);
    const token = await this.authService.generatePasswordResetToken(user.id);
    await this.service.sendResetPassword(user.email, token.token, user.firstName);
  }
}
