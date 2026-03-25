import { Request } from 'express';

import { AuthenticatedReq } from '@crm/auth';

import { BaseEvent } from '../base.event';
import { PlatformClientUpdatedDto } from '../dto';
import { toEventMetadata } from '../../helper/metadata.helper';

/**
 * Occurs when an existing platform client is updated
 **/
export class PlatformClientUpdatedEvent extends BaseEvent<PlatformClientUpdatedDto> {
  static readonly type = 'platform-client.updated';

  constructor(payload: PlatformClientUpdatedDto, req?: Request | AuthenticatedReq) {
    super(payload, toEventMetadata(req as any));
  }
}
