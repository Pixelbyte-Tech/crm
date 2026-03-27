import { Request } from 'express';

import { AuthenticatedReq } from '@crm/auth';

import { BaseEvent } from '../base.event';
import { TradingAccountUpdatedDto } from '../dto';
import { toEventMetadata } from '../../helper/metadata.helper';

/**
 * Occurs when an existing trading account is updated
 **/
export class TradingAccountUpdatedEvent extends BaseEvent<TradingAccountUpdatedDto> {
  static readonly type = 'trading-account.updated';

  constructor(payload: TradingAccountUpdatedDto, req?: Request | AuthenticatedReq) {
    super(payload, toEventMetadata(req as any));
  }
}
