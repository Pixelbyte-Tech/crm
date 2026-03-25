import { Request } from 'express';

import { AuthenticatedReq } from '@crm/auth';

import { BaseEvent } from '../base.event';
import { IntegrationCreatedDto } from '../dto';
import { toEventMetadata } from '../../helper/metadata.helper';

/**
 * Occurs when a new integration is created in the system
 **/
export class IntegrationCreatedEvent extends BaseEvent<IntegrationCreatedDto> {
  static readonly type = 'integration.created';

  constructor(payload: IntegrationCreatedDto, req?: Request | AuthenticatedReq) {
    super(payload, toEventMetadata(req as any));
  }
}
