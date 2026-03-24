import { Request } from 'express';

import { AuthenticatedReq } from '@crm/auth';

import { UserUpdatedDto } from '../dto';
import { BaseEvent } from '../base.event';
import { toEventMetadata } from '../../helper/metadata.helper';

/**
 * Occurs when an existing user is updated
 **/
export class UserUpdatedEvent extends BaseEvent<UserUpdatedDto> {
  static readonly type = 'user.updated';

  constructor(payload: UserUpdatedDto, req?: Request | AuthenticatedReq) {
    super(payload, toEventMetadata(req as any));
  }
}
