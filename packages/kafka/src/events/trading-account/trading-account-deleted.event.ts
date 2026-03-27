import { Request } from 'express';

import { AuthenticatedReq } from '@crm/auth';

import { BaseEvent } from '../base.event';
import { TradingAccountDeletedDto } from '../dto';
import { toEventMetadata } from '../../helper/metadata.helper';

/**
 * Occurs when an existing trading account is deleted
 **/
export class TradingAccountDeletedEvent extends BaseEvent<TradingAccountDeletedDto> {
  static readonly type = 'trading-account.deleted';

  constructor(payload: TradingAccountDeletedDto, req?: Request | AuthenticatedReq) {
    super(payload, toEventMetadata(req as any));
  }
}
