import { DateTime } from 'luxon';
import { Logger } from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';
import { LessThan, Repository } from 'typeorm';
import { Process, Processor } from '@nestjs/bull';
import { InjectRepository } from '@nestjs/typeorm';

import { UserNotificationEntity } from '@crm/database';
import { NotificationStatus, NotificationTemplate } from '@crm/types';

import { JobType } from '../types';
import { MailService } from '../services';

@Processor('notification-queue')
export class SendMailProcessor {
  constructor(
    private readonly mailService: MailService,
    @InjectRepository(UserNotificationEntity) private readonly userNotificationRepo: Repository<UserNotificationEntity>,
  ) {}

  private readonly logger = new Logger(this.constructor.name);

  /**
   * Handles the job
   */
  @Process(JobType.SEND_MAIL)
  async handle() {
    return Sentry.startNewTrace(async () => {
      return Sentry.startSpan({ name: JobType.SEND_MAIL, op: 'notification' }, async () => {
        const msg = `Processing mail notifications`;
        this.logger.log(`${msg} - Start`);

        try {
          const notifications = await this.userNotificationRepo.find({
            where: {
              status: NotificationStatus.PENDING,
              scheduledAt: LessThan(new Date()),
              deliveryAttempts: LessThan(50),
            },
          });

          for (const notification of notifications) {
            let meta: any;
            const result = false;

            switch (notification.template) {
              case NotificationTemplate.USER_CONFIRM_EMAIL:
                meta = notification.meta as unknown as UserNotificationEntity;
                await this.mailService.sendConfirmEmail(meta.status, '');
                break;
              case NotificationTemplate.USER_FORGOT_PASSWORD:
                await this.mailService.sendResetPassword('meta.', '');
                break;
            }

            // Increment delivery attempts
            notification.deliveryAttempts = (notification.deliveryAttempts || 0) + 1;

            // Update the delivery details based on the result
            if (result) {
              notification.deliveredAt = DateTime.utc().toJSDate();
              notification.status = NotificationStatus.DELIVERED;
            } else {
              notification.status = NotificationStatus.FAILED;
            }

            // Persist
            await this.userNotificationRepo.save(notification);
            this.logger.log(`Processed notification '${notification.id}' with template '${notification.template}'`);
          }

          this.logger.log(`${msg} - Complete`);
        } catch (err) {
          this.logger.error(`${msg} - Failed`, err);
          Sentry.captureException(err, { tags: { component: SendMailProcessor.name, process: JobType.SEND_MAIL } });

          throw err;
        }
      });
    });
  }
}
