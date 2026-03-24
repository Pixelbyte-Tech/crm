import { Request } from 'express';

import { AuthenticatedReq } from '@crm/auth';

import { UserCreatedDto } from '../dto';
import { BaseEvent } from '../base.event';
import { toEventMetadata } from '../../helper/metadata.helper';

/**
 * Occurs when a new user is created in the system
 **/
export class UserCreatedEvent extends BaseEvent<UserCreatedDto> {
  static readonly type = 'user.created';

  constructor(payload: UserCreatedDto, req?: Request | AuthenticatedReq) {
    super(payload, toEventMetadata(req as any));
  }
}
