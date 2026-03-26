import { Request } from 'express';

import { AuthenticatedReq } from '@crm/auth';

import { BaseEvent } from '../base.event';
import { TradingAccountSchemaDeletedDto } from '../dto';
import { toEventMetadata } from '../../helper/metadata.helper';

/**
 * Occurs when an existing trading account schema is deleted
 **/
export class TradingAccountSchemaDeletedEvent extends BaseEvent<TradingAccountSchemaDeletedDto> {
  static readonly type = 'trading-account-schema.deleted';

  constructor(payload: TradingAccountSchemaDeletedDto, req?: Request | AuthenticatedReq) {
    super(payload, toEventMetadata(req as any));
  }
}
