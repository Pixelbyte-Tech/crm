import { Job } from 'bull';
import { Scope, Injectable } from '@nestjs/common';

import { EcsLogger } from '@crm/logger';

@Injectable({ scope: Scope.TRANSIENT })
export class BullLogger extends EcsLogger {
  /** The job bound to this instance */
  #job: Job | undefined;

  /** The logger context */
  #context: string | undefined;

  /**
   * Binds the context and job to the logger. The job is
   * used to log messages to the job's log.
   * @param context The context to bind to the logger
   * @param job The job to bind to the logger
   */
  bind(context: string, job: Job): void {
    this.#context = context;
    this.#job = job;
  }

  debug(message: any, ...optionalParams: any[]): void {
    const msg = this.toEcs(message, 'debug', [...optionalParams, this.#context]);
    if (msg) console.log(msg);
    this.#job?.log(message).catch((err) => console.error(err));
  }

  log(message: any, ...optionalParams: any[]): void {
    const msg = this.toEcs(message, 'info', [...optionalParams, this.#context]);
    if (msg) console.log(msg);
    this.#job?.log(message).catch((err) => console.error(err));
  }

  warn(message: any, ...optionalParams: any[]): void {
    const msg = this.toEcs(message, 'warn', [...optionalParams, this.#context]);
    if (msg) {
      console.log(msg);
    }
    this.#job?.log(message).catch((err) => console.error(err));
  }

  error(message: any, ...optionalParams: any[]): void {
    const msg = this.toEcs(message, 'error', [...optionalParams, this.#context]);
    if (msg) {
      console.log(msg);
      this.#job?.log(msg).catch((err) => console.error(err));
    }
  }
}
