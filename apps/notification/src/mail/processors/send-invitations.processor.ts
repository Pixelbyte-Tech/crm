import { Job } from 'bull';
import { DateTime } from 'luxon';
import * as Sentry from '@sentry/nestjs';
import { In, Repository } from 'typeorm';
import { Process, Processor } from '@nestjs/bull';
import { InjectRepository } from '@nestjs/typeorm';

import { GlobalSettingKey, InvitationStatus } from '@crm/types';
import { InvitationEntity, GlobalSettingEntity } from '@crm/database';

import { JobType } from '../types';
import { BullLogger, MailService } from '../services';

@Processor('notification-queue')
export class SendInvitationsProcessor {
  constructor(
    private readonly logger: BullLogger,
    private readonly mailService: MailService,
    @InjectRepository(InvitationEntity) private readonly invitationRepo: Repository<InvitationEntity>,
    @InjectRepository(GlobalSettingEntity) private readonly settingRepo: Repository<GlobalSettingEntity>,
  ) {}

  /**
   * Handles the job
   */
  @Process({ name: JobType.SEND_INVITATIONS, concurrency: 1 })
  async handle(job: Job) {
    return Sentry.startNewTrace(async () => {
      return Sentry.startSpan({ name: JobType.SEND_INVITATIONS, op: 'notification' }, async () => {
        // Bind the logger
        this.logger.bind(SendInvitationsProcessor.name, job);

        const msg = `Processing mail invitations`;
        this.logger.log(`${msg} - Start`);

        // Fetch the company name
        const setting = await this.settingRepo.findOne({ where: { key: GlobalSettingKey.COMPANY_NAME } });
        const companyName = (setting?.value as string) || 'PixelByte CRM';

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
              continue;
            }

            this.logger.warn(`Failed to send invitation '${invitation.id}' to '${invitation.email}'`);
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
