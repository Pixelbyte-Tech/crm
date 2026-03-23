import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Logger, Injectable, NotFoundException } from '@nestjs/common';

import { NotificationTemplate } from '@crm/types';
import { UserEntity, UserNotificationEntity } from '@crm/database';

import { AuthService } from '../../../../auth/services';
import { ConfirmEmailDto, ForgotPasswordDto } from '../dto';

@Injectable()
export class NotificationService {
  constructor(
    private readonly authService: AuthService,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(UserNotificationEntity)
    private readonly userNotificationRepo: Repository<UserNotificationEntity>,
  ) {}

  readonly #logger: Logger = new Logger(this.constructor.name);

  /**
   * Schedules a forgot password notification to be sent to the provided address
   * @param dto Details for sending the notification
   */
  async scheduleForgotPassword(dto: ForgotPasswordDto): Promise<boolean> {
    const msg = `Scheduling forgot password for '${dto.email}'`;
    this.#logger.log(`${msg} - Start`);

    // Find the user by email
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user) {
      this.#logger.error(`${msg} - Failed`);
      throw new NotFoundException(`Failed to find user with email '${dto.email}'`);
    }

    try {
      const token = await this.authService.generatePasswordResetToken(user.id);
      const result = await this.userNotificationRepo.insert({
        template: NotificationTemplate.USER_FORGOT_PASSWORD,
        companyId: user.companyId,
        userId: user.id,
        meta: { token: token.token, expireMs: token.expireMs },
      });

      return result.identifiers.length > 0;
    } catch (err) {
      this.#logger.error(`${err}`);
      return false;
    }
  }

  /**
   * Schedules an email confirmation notification to be sent to the provided address
   * @param dto Details for sending the notification
   */
  async scheduleConfirmEmail(dto: ConfirmEmailDto): Promise<boolean> {
    const msg = `Scheduling confirm email for '${dto.email}'`;
    this.#logger.log(`${msg} - Start`);

    // Find the user by email
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user) {
      this.#logger.error(`${msg} - Failed`);
      throw new NotFoundException(`Failed to find user with email '${dto.email}'`);
    }

    try {
      const token = await this.authService.generateEmailConfirmationToken(user.id);
      const result = await this.userNotificationRepo.insert({
        template: NotificationTemplate.USER_CONFIRM_EMAIL,
        companyId: user.companyId,
        userId: user.id,
        meta: { token: token.token, expireMs: token.expireMs },
      });

      return result.identifiers.length > 0;
    } catch (err) {
      this.#logger.error(`${err}`);
      return false;
    }
  }
}
