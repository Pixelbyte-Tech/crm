import { Request } from 'express';

import { AuthenticatedReq } from '@crm/auth';

import { BaseEvent } from '../base.event';
import { UserNoteUpdatedDto } from '../dto';
import { toEventMetadata } from '../../helper/metadata.helper';

/**
 * Occurs when an existing user note is updated
 **/
export class UserNoteUpdatedEvent extends BaseEvent<UserNoteUpdatedDto> {
  static readonly type = 'user.updated';

  constructor(payload: UserNoteUpdatedDto, req?: Request | AuthenticatedReq) {
    super(payload, toEventMetadata(req as any));
  }
}
