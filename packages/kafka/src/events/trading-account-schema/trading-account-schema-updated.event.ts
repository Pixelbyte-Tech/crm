import { Request } from 'express';

import { AuthenticatedReq } from '@crm/auth';

import { BaseEvent } from '../base.event';
import { TradingAccountSchemaUpdatedDto } from '../dto';
import { toEventMetadata } from '../../helper/metadata.helper';

/**
 * Occurs when an existing trading account schema is updated
 **/
export class TradingAccountSchemaUpdatedEvent extends BaseEvent<TradingAccountSchemaUpdatedDto> {
  static readonly type = 'trading-account-schema.updated';

  constructor(payload: TradingAccountSchemaUpdatedDto, req?: Request | AuthenticatedReq) {
    super(payload, toEventMetadata(req as any));
  }
}
