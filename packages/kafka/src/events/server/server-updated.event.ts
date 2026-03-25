import { Request } from 'express';

import { AuthenticatedReq } from '@crm/auth';

import { BaseEvent } from '../base.event';
import { ServerUpdatedDto } from '../dto';
import { toEventMetadata } from '../../helper/metadata.helper';

/**
 * Occurs when an existing server is updated
 **/
export class ServerUpdatedEvent extends BaseEvent<ServerUpdatedDto> {
  static readonly type = 'server.updated';

  constructor(payload: ServerUpdatedDto, req?: Request | AuthenticatedReq) {
    super(payload, toEventMetadata(req as any));
  }
}
