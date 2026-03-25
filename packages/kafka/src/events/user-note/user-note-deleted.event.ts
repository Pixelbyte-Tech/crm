import { Request } from 'express';

import { AuthenticatedReq } from '@crm/auth';

import { BaseEvent } from '../base.event';
import { UserNoteDeletedDto } from '../dto';
import { toEventMetadata } from '../../helper/metadata.helper';

/**
 * Occurs when an existing user note is deleted
 **/
export class UserNoteDeletedEvent extends BaseEvent<UserNoteDeletedDto> {
  static readonly type = 'user-note.deleted';

  constructor(payload: UserNoteDeletedDto, req?: Request | AuthenticatedReq) {
    super(payload, toEventMetadata(req as any));
  }
}
