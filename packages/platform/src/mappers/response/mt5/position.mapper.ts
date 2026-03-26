import { DateTime } from 'luxon';
import { Injectable } from '@nestjs/common';

import { Side, PositionStatus } from '@crm/types';

import { Position } from '../../../models/position';
import { Mt5Position } from '../../../types/mt5/trade/position.type';

@Injectable()
export class PositionMapper {
  toPosition(data: Mt5Position, serverSecToUtcSec: (n: number) => number): Position {
    return new Position({
      openedAt: DateTime.fromSeconds(serverSecToUtcSec(data.timeCreate)).toJSDate(),
      closedAt: undefined,
      accountId: data.login.toString(),
      positionId: data.position.toString(),
      tradeId: undefined,
      side: 'POSITION_BUY' === data.action ? Side.BUY : Side.SELL,
      status: PositionStatus.OPEN,
      symbol: data.symbol,
      openPrice: data.priceOpen,
      closePrice: undefined,
      takeProfit: data?.priceTP && data.priceTP !== 0 ? data.priceTP : undefined,
      stopLoss: data?.priceSL && data.priceSL !== 0 ? data.priceSL : undefined,
      lots: data.volume / 10_000,
      spread: undefined,
      commission: undefined,
      swap: data.storage,
      profit: data.profit,
      comment: data.comment,
    });
  }
}
