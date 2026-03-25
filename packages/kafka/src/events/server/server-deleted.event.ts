import { Request } from 'express';

import { AuthenticatedReq } from '@crm/auth';

import { BaseEvent } from '../base.event';
import { ServerDeletedDto } from '../dto';
import { toEventMetadata } from '../../helper/metadata.helper';

/**
 * Occurs when an existing server is deleted
 **/
export class ServerDeletedEvent extends BaseEvent<ServerDeletedDto> {
  static readonly type = 'server.deleted';

  constructor(payload: ServerDeletedDto, req?: Request | AuthenticatedReq) {
    super(payload, toEventMetadata(req as any));
  }
}
