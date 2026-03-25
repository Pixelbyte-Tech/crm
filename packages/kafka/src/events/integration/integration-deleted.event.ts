import { Request } from 'express';

import { AuthenticatedReq } from '@crm/auth';

import { BaseEvent } from '../base.event';
import { IntegrationDeletedDto } from '../dto';
import { toEventMetadata } from '../../helper/metadata.helper';

/**
 * Occurs when an existing integration is deleted
 **/
export class IntegrationDeletedEvent extends BaseEvent<IntegrationDeletedDto> {
  static readonly type = 'integration.deleted';

  constructor(payload: IntegrationDeletedDto, req?: Request | AuthenticatedReq) {
    super(payload, toEventMetadata(req as any));
  }
}
