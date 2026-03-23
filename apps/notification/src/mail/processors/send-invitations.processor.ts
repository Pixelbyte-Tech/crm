import { DateTime } from 'luxon';
import { Logger } from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';
import { In, Repository } from 'typeorm';
import { Process, Processor } from '@nestjs/bull';
import { InjectRepository } from '@nestjs/typeorm';

import { GlobalSettingKey, InvitationStatus } from '@crm/types';
import { InvitationEntity, GlobalSettingEntity } from '@crm/database';

import { JobType } from '../types';
import { MailService } from '../services';

@Processor('notification-queue')
export class SendInvitationsProcessor {
  constructor(
    private readonly mailService: MailService,
    @InjectRepository(InvitationEntity) private readonly invitationRepo: Repository<InvitationEntity>,
    @InjectRepository(GlobalSettingEntity) private readonly settingRepo: Repository<GlobalSettingEntity>,
  ) {}

  private readonly logger = new Logger(this.constructor.name);

  /**
   * Handles the job
   */
  @Process({ name: JobType.SEND_INVITATIONS, concurrency: 1 })
  async handle() {
    return Sentry.startNewTrace(async () => {
      return Sentry.startSpan({ name: JobType.SEND_INVITATIONS, op: 'notification' }, async () => {
        const msg = `Processing mail invitations`;
        this.logger.log(`${msg} - Start`);

        // Fetch the company name
        const setting = await this.settingRepo.findOne({ where: { key: GlobalSettingKey.COMPANY_NAME } });
        const companyName = (setting?.value as string) || 'CRM';

        try {
          // Fetch all invitations to mail
          const invitations = await this.invitationRepo.find({
            where: { status: In([InvitationStatus.UNSENT, InvitationStatus.RESEND_PENDING]) },
          });

          for (const invitation of invitations) {
            const result = await this.mailService.sendInvitationEmail(invitation.email, companyName, invitation.token);
            if (result) {
              // Update the invitation details
              const prop = !invitation.firstSentAt ? 'firstSentAt' : 'lastSentAt';
              invitation[prop] = DateTime.utc().toJSDate();
              invitation.status = InvitationStatus.PENDING;

              // Persist
              await this.invitationRepo.save(invitation);
              this.logger.log(`Processed invitation '${invitation.id}' to '${invitation.email}'`);
            }
          }

          this.logger.log(`${msg} - Complete`);
        } catch (err) {
          this.logger.error(`${msg} - Failed`, err);
          Sentry.captureException(err, {
            tags: { component: SendInvitationsProcessor.name, process: JobType.SEND_INVITATIONS },
          });

          throw err;
        }
      });
    });
  }
}
