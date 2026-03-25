import { Request } from 'express';

import { AuthenticatedReq } from '@crm/auth';

import { BaseEvent } from '../base.event';
import { ServerCreatedDto } from '../dto';
import { toEventMetadata } from '../../helper/metadata.helper';

/**
 * Occurs when a new server is created in the system
 **/
export class ServerCreatedEvent extends BaseEvent<ServerCreatedDto> {
  static readonly type = 'server.created';

  constructor(payload: ServerCreatedDto, req?: Request | AuthenticatedReq) {
    super(payload, toEventMetadata(req as any));
  }
}
