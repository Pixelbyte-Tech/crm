import { InjectQueue } from '@nestjs/bull';
import { Job, Queue, JobOptions } from 'bull';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';

import { Env } from '@crm/utils';

import { JobType } from '../types';

@Injectable()
export class JobsService implements OnApplicationBootstrap {
  constructor(@InjectQueue('invitation-queue') private readonly queue: Queue) {}

  /**
   * Runs on application Bootstrap
   */
  onApplicationBootstrap() {
    void this.#bootstrapSchedule();

    // For some reason, certain jobs end up disappearing from the
    // repeatable queue after some time. This exists to
    // re-build the queue every n mins
    setInterval(() => this.#bootstrapSchedule(), 60_000 * 15);

    // Clean all completed jobs every 2 mins
    setInterval(() => this.queue.clean(0, 'completed'), 120_000);
  }

  /**
   * Bootstraps the schedule
   * For cron reference: https://crontab.guru/
   */
  async #bootstrapSchedule() {
    // Flush only repeatable jobs
    for (const job of await this.queue.getRepeatableJobs()) {
      await this.queue.removeRepeatableByKey(job.key);
    }

    // Wait for 3 seconds
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Do not run on locally
    if (Env.isDev()) {
      return;
    }

    //////////////////////////////////////////////////////////////
    // Sync Jobs (Scheduled)

    await this.#scheduleJob(JobType.EXPIRE_INVITATIONS, '*/30 * * * *');
  }

  /**
   * Adds a job to the queue. All jobs are scheduled to run based on the cron expression.
   * The name of the job is used to identify the job and prevent duplicate jobs from being added to the queue.
   * @param name The name of the job.
   * @param cron The cron expression.
   * @param opts The options to pass to the job.
   * @param queue The queue to add the job to.
   */
  async #scheduleJob(name: string, cron: string, opts?: JobOptions, queue: Queue = this.queue): Promise<Job> {
    return queue.add(
      name,
      {},
      {
        repeat: { cron },
        priority: 2,
        attempts: 1,
        jobId: name,
        ...opts,
      },
    );
  }
}
