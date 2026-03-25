import { Request } from 'express';

import { AuthenticatedReq } from '@crm/auth';

import { BaseEvent } from '../base.event';
import { UserEmailUpdatedDto } from '../dto';
import { toEventMetadata } from '../../helper/metadata.helper';

/**
 * Occurs when an existing user email is updated
 **/
export class UserEmailUpdatedEvent extends BaseEvent<UserEmailUpdatedDto> {
  static readonly type = 'user-email.updated';

  constructor(payload: UserEmailUpdatedDto, req?: Request | AuthenticatedReq) {
    super(payload, toEventMetadata(req as any));
  }
}
