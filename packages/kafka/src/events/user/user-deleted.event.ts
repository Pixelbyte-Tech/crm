import { Request } from 'express';

import { AuthenticatedReq } from '@crm/auth';

import { UserDeletedDto } from '../dto';
import { BaseEvent } from '../base.event';
import { toEventMetadata } from '../../helper/metadata.helper';

/**
 * Occurs when an existing user is deleted
 **/
export class UserDeletedEvent extends BaseEvent<UserDeletedDto> {
  static readonly type = 'user.deleted';

  constructor(payload: UserDeletedDto, req?: Request | AuthenticatedReq) {
    super(payload, toEventMetadata(req as any));
  }
}
