import { Request } from 'express';

import { AuthenticatedReq } from '@crm/auth';

import { BaseEvent } from '../base.event';
import { PlatformClientDeletedDto } from '../dto';
import { toEventMetadata } from '../../helper/metadata.helper';

/**
 * Occurs when an existing platform client is deleted
 **/
export class PlatformClientDeletedEvent extends BaseEvent<PlatformClientDeletedDto> {
  static readonly type = 'platform-client.deleted';

  constructor(payload: PlatformClientDeletedDto, req?: Request | AuthenticatedReq) {
    super(payload, toEventMetadata(req as any));
  }
}
