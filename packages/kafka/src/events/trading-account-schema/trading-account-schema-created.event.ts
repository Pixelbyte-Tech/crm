import { Request } from 'express';

import { AuthenticatedReq } from '@crm/auth';

import { BaseEvent } from '../base.event';
import { TradingAccountSchemaCreatedDto } from '../dto';
import { toEventMetadata } from '../../helper/metadata.helper';

/**
 * Occurs when a new trading account schema is created in the system
 **/
export class TradingAccountSchemaCreatedEvent extends BaseEvent<TradingAccountSchemaCreatedDto> {
  static readonly type = 'trading-account-schema.created';

  constructor(payload: TradingAccountSchemaCreatedDto, req?: Request | AuthenticatedReq) {
    super(payload, toEventMetadata(req as any));
  }
}
