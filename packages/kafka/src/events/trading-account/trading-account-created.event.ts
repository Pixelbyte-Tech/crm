import { Request } from 'express';

import { AuthenticatedReq } from '@crm/auth';

import { BaseEvent } from '../base.event';
import { TradingAccountCreatedDto } from '../dto';
import { toEventMetadata } from '../../helper/metadata.helper';

/**
 * Occurs when a new trading account is created in the system
 **/
export class TradingAccountCreatedEvent extends BaseEvent<TradingAccountCreatedDto> {
  static readonly type = 'trading-account.created';

  constructor(payload: TradingAccountCreatedDto, req?: Request | AuthenticatedReq) {
    super(payload, toEventMetadata(req as any));
  }
}
