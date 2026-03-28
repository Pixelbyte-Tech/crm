import { DateTime } from 'luxon';
import { Injectable } from '@nestjs/common';

import { Side, PositionStatus } from '@crm/types';

import { Position } from '../../../models';

import { Mt5Deal } from '../../../types/mt5/trade/deal.type';

import { UnprocessableResponseException } from '../../../exceptions';

@Injectable()
export class DealMapper {
  toPosition(data: Mt5Deal, serverSecToUtcSec: (x: number) => number): Position {
    const { openedAt, closedAt, status } = this.#toPositionStatusData(data, serverSecToUtcSec);

    return new Position({
      openedAt,
      closedAt,
      accountId: data.login.toString(),
      positionId: data.positionID.toString(),
      tradeId: data.deal.toString(),
      side: this.#toPositionSide(data.action),
      status,
      symbol: data.symbol,
      openPrice: data.price,
      closePrice: undefined,
      takeProfit: data?.priceTP && data.priceTP !== 0 ? data.priceTP : undefined,
      stopLoss: data?.priceSL && data.priceSL !== 0 ? data.priceSL : undefined,
      lots: data.volume / 10_000,
      spread: undefined,
      commission: data.commission,
      swap: data.storage,
      profit: data.profit,
      comment: data.comment,
    });
  }

  /**
   * Convert mt5 position action to our own position side.
   * @param action the action coming from mt5
   */
  #toPositionSide(action: string): Side {
    switch (action) {
      case 'DEAL_BUY':
        return Side.BUY;
      case 'DEAL_SELL':
        return Side.SELL;
      default:
        throw new UnprocessableResponseException('type', action);
    }
  }

  #toPositionStatusData(data: Mt5Deal, serverSecToUtcSec: (x: number) => number) {
    switch (data.entry) {
      case 'ENTRY_IN':
        return {
          status: PositionStatus.OPEN,
          openedAt: DateTime.fromSeconds(serverSecToUtcSec(data.time)).toJSDate(),
          closedAt: undefined,
        };
      case 'ENTRY_OUT':
        return {
          status: data.volumeLots === data.volumeClosedLots ? PositionStatus.FULL_CLOSE : PositionStatus.PARTIAL_CLOSE,
          closedAt: DateTime.fromSeconds(serverSecToUtcSec(data.time)).toJSDate(),
          openedAt: undefined,
        };
      default:
        throw new UnprocessableResponseException('type', data.entry);
    }
  }
}
