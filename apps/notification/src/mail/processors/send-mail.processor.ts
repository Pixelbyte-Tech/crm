import { Job } from 'bull';
import { DateTime } from 'luxon';
import * as Sentry from '@sentry/nestjs';
import { LessThan, Repository } from 'typeorm';
import { Process, Processor } from '@nestjs/bull';
import { InjectRepository } from '@nestjs/typeorm';

import { UserNotificationEntity } from '@crm/database';
import { NotificationStatus, NotificationTemplate } from '@crm/types';

import { JobType } from '../types';
import { BullLogger, MailService } from '../services';

@Processor('notification-queue')
export class SendMailProcessor {
  constructor(
    private readonly logger: BullLogger,
    private readonly mailService: MailService,
    @InjectRepository(UserNotificationEntity) private readonly userNotificationRepo: Repository<UserNotificationEntity>,
  ) {}

  /**
   * Handles the job
   */
  @Process({ name: JobType.SEND_MAIL, concurrency: 1 })
  async handle(job: Job) {
    return Sentry.startNewTrace(async () => {
      return Sentry.startSpan({ name: JobType.SEND_MAIL, op: 'processor' }, async () => {
        // Bind the logger
        this.logger.bind(SendMailProcessor.name, job);

        const msg = `Processing mail notifications`;
        this.logger.log(`${msg} - Start`);

        try {
          // Fetch all notifications to mail
          const notifications = await this.userNotificationRepo.find({
            relations: { user: true },
            where: {
              status: NotificationStatus.PENDING,
              scheduledAt: LessThan(new Date()),
              deliveryAttempts: LessThan(50),
            },
            take: 20,
          });

          // Process them
          for (const notification of notifications) {
            let meta: any;
            let result = false;

            switch (notification.template) {
              case NotificationTemplate.USER_CONFIRM_EMAIL:
                meta = notification.meta as unknown as { token: string; expireMs: number };
                result = await this.mailService.sendConfirmEmail(
                  notification.user.email,
                  meta.token,
                  notification.user.firstName,
                );
                break;
              case NotificationTemplate.USER_FORGOT_PASSWORD:
                meta = notification.meta as unknown as { token: string; expireMs: number };
                result = await this.mailService.sendResetPassword(
                  notification.user.email,
                  meta.token,
                  notification.user.firstName,
                );
                break;
              default:
                this.logger.error(`Unknown template '${notification.template}' for notification '${notification.id}'`);
                break;
            }

            // Increment delivery attempts
            notification.deliveryAttempts = (notification.deliveryAttempts || 0) + 1;

            // Update the delivery details based on the result
            if (result) {
              notification.deliveredAt = DateTime.utc().toJSDate();
              notification.status = NotificationStatus.DELIVERED;
            }

            // Persist
            await this.userNotificationRepo.save(notification);

            if (result) {
              this.logger.log(`Processed notification '${notification.id}' with template '${notification.template}'`);
              continue;
            }

            this.logger.warn(
              `Failed to send notification '${notification.id}' with template '${notification.template}'`,
            );
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
