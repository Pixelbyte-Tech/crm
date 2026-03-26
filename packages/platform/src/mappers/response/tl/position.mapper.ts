import { Injectable } from '@nestjs/common';

import { Side, PositionStatus } from '@crm/types';

import { Position } from '../../../models/position';
import { TlPosition } from '../../../types/tl/trade/position.type';

@Injectable()
export class PositionMapper {
  toPosition(data: TlPosition): Position {
    return new Position({
      openedAt: new Date(data.openDateTime),
      accountId: data.accountId,
      positionId: data.positionId,
      tradeId: data.openTradeId,
      symbol: data.instrument,
      openPrice: Number(data.openPrice),
      takeProfit: data.tpPrice ? Number(data.tpPrice) : undefined,
      stopLoss: data.slPrice ? Number(data.slPrice) : undefined,
      lots: Number(data.lots),
      spread: undefined,
      commission: Number(data.commission),
      swap: Number(data.swap),
      profit: Number(data.pnl),
      comment: undefined,
      side: 'BUY' === data.side ? Side.BUY : Side.SELL,
      status: PositionStatus.OPEN,
    });
  }

  toPositions(data: TlPosition[]): Position[] {
    return data.map(this.toPosition);
  }
}
