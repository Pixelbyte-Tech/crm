import { Request } from 'express';

import { AuthenticatedReq } from '@crm/auth';

import { BaseEvent } from '../base.event';
import { IntegrationUpdatedDto } from '../dto';
import { toEventMetadata } from '../../helper/metadata.helper';

/**
 * Occurs when an existing integration is updated
 **/
export class IntegrationUpdatedEvent extends BaseEvent<IntegrationUpdatedDto> {
  static readonly type = 'integration.updated';

  constructor(payload: IntegrationUpdatedDto, req?: Request | AuthenticatedReq) {
    super(payload, toEventMetadata(req as any));
  }
}
