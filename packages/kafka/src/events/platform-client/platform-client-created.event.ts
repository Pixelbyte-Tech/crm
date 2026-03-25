import { Request } from 'express';

import { AuthenticatedReq } from '@crm/auth';

import { BaseEvent } from '../base.event';
import { PlatformClientCreatedDto } from '../dto';
import { toEventMetadata } from '../../helper/metadata.helper';

/**
 * Occurs when a new platform client is created in the system
 **/
export class PlatformClientCreatedEvent extends BaseEvent<PlatformClientCreatedDto> {
  static readonly type = 'platform-client.created';

  constructor(payload: PlatformClientCreatedDto, req?: Request | AuthenticatedReq) {
    super(payload, toEventMetadata(req as any));
  }
}
