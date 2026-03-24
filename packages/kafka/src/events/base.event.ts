import { randomUUID } from 'node:crypto';

import { EventMetadata } from './types';

export abstract class BaseEvent<T, M = EventMetadata> {
  protected constructor(
    readonly data: T,
    readonly metadata?: M,
  ) {
    this.id = randomUUID();
  }

  /** Unique identifier for the event */
  id: string;

  toString() {
    return JSON.stringify(this);
  }
}
