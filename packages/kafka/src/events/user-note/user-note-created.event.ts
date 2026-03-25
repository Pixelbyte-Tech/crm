import { Request } from 'express';

import { AuthenticatedReq } from '@crm/auth';

import { BaseEvent } from '../base.event';
import { UserNoteCreatedDto } from '../dto';
import { toEventMetadata } from '../../helper/metadata.helper';

/**
 * Occurs when a new user is created note in the system
 **/
export class UserNoteCreatedEvent extends BaseEvent<UserNoteCreatedDto> {
  static readonly type = 'user-note.created';

  constructor(payload: UserNoteCreatedDto, req?: Request | AuthenticatedReq) {
    super(payload, toEventMetadata(req as any));
  }
}
