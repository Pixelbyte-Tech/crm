import { Job } from 'bull';
import { DateTime } from 'luxon';
import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';
import { Process, Processor } from '@nestjs/bull';
import { InjectRepository } from '@nestjs/typeorm';

import { InvitationStatus } from '@crm/types';
import { InvitationEntity } from '@crm/database';

import { JobType } from '../types';

@Processor('invitations-queue')
export class ExpireInvitationsProcessor {
  constructor(@InjectRepository(InvitationEntity) private readonly invitationRepo: Repository<InvitationEntity>) {}

  private readonly logger = new Logger(this.constructor.name);

  /**
   * Handles the job
   * @param job The job to process
   */
  @Process(JobType.EXPIRE_INVITATIONS)
  async handle(job: Job) {
    const { integrationId } = job.data;

    return Sentry.startNewTrace(async () => {
      return Sentry.startSpan(
        {
          name: JobType.EXPIRE_INVITATIONS,
          op: 'processor',
        },
        async () => {
          const msg = `Processing invitations expiration`;
          this.logger.log(`${msg} - Start`);

          try {
            const invitations = await this.invitationRepo.find({ where: { status: InvitationStatus.PENDING } });
            for (const invitation of invitations) {
              const expirationDate = DateTime.fromJSDate(invitation.createdAt).plus({ days: invitation.expiresInDays });

              if (DateTime.now() >= expirationDate) {
                invitation.status = InvitationStatus.EXPIRED;
                await this.invitationRepo.save(invitation);
                this.logger.log(`Expired invitation '${invitation.id}' for email '${invitation.email}'`);
              }
            }

            this.logger.log(`${msg} - Complete`);
          } catch (err) {
            this.logger.error(`${msg} - Failed`, err);
            Sentry.captureException(err, {
              tags: {
                component: ExpireInvitationsProcessor.name,
                process: JobType.EXPIRE_INVITATIONS,
                integrationId: integrationId,
              },
            });

            throw err;
          }
        },
      );
    });
  }
}
