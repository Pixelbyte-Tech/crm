import { Job } from 'bull';
import * as Sentry from '@sentry/nestjs';
import { Process, Processor } from '@nestjs/bull';

import { JobType } from '../types';
import { BullLogger, TradingAccountService } from '../services';

@Processor('trading-account-queue')
export class DeleteAccountProcessor {
  constructor(
    private readonly logger: BullLogger,
    private readonly tradingAccountService: TradingAccountService,
  ) {}

  /**
   * Handles the job
   * @param job The job to process
   */
  @Process(JobType.DELETE_ACCOUNT)
  async handle(job: Job<{ tradingAccountId: string }>) {
    const { tradingAccountId } = job.data;

    return Sentry.startNewTrace(async () => {
      return Sentry.startSpan({ name: JobType.DELETE_ACCOUNT, op: 'processor' }, async () => {
        // Bind the logger
        this.logger.bind(DeleteAccountProcessor.name, job);

        if (!tradingAccountId) {
          this.logger.error(`Missing required job params, skipping...`);
        }

        const msg = `Deleting trading account ${tradingAccountId}`;
        this.logger.log(`${msg} - Start`);

        try {
          // Process the deletion
          await this.tradingAccountService.delete(tradingAccountId);
          this.logger.log(`${msg} - Complete`);
        } catch (err) {
          this.logger.error(`${msg} - Failed`, err);
          Sentry.captureException(err, {
            tags: { component: DeleteAccountProcessor.name, process: JobType.DELETE_ACCOUNT, tradingAccountId },
          });

          throw err;
        }
      });
    });
  }
}
