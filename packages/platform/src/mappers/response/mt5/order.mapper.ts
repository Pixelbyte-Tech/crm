import { DateTime } from 'luxon';
import { Injectable } from '@nestjs/common';

import { OrderType } from '@crm/types';

import { Order } from '../../../models';

import { Mt5Order } from '../../../types/mt5/trade/order.type';

import { UnprocessableResponseException } from '../../../exceptions';

@Injectable()
export class OrderMapper {
  /**
   * Convert mt5 order -> our own
   * @param data The mt5 order response
   * @param serverSecToUtcSec the server to utc secs converter
   */
  toOrder(data: Mt5Order, serverSecToUtcSec: (x: number) => number): Order {
    return new Order({
      orderId: data.order.toString(),
      accountId: data.login.toString(),
      type: this.#toOrderType(data.type),
      status: this.#toStatus(data.state),
      symbol: data.symbol,
      triggerPrice: data.priceOrder,
      takeProfit: data?.priceTP && data.priceTP !== 0 ? data.priceTP : undefined,
      stopLoss: data?.priceSL && data.priceSL !== 0 ? data.priceSL : undefined,
      lots: data.volumeCurrentLots,
      swap: undefined,
      comment: data.comment,
      placedAt: DateTime.fromSeconds(serverSecToUtcSec(data.timeSetup)).toJSDate(),
      expiresAt:
        data?.timeExpiration && data.timeExpiration !== 0
          ? DateTime.fromSeconds(data.timeExpiration).toJSDate()
          : undefined,
    });
  }

  /**
   * Convert mt5 state to status
   * @param state The mt5 state
   */
  #toStatus(state: string) {
    switch (state) {
      case 'ORDER_STATE_PLACED':
      case 'ORDER_STATE_STARTED':
        return 'OPEN';

      case 'ORDER_STATE_CANCELED':
        return 'CANCEL';

      default:
        throw new UnprocessableResponseException('order state', state);
    }
  }

  /**
   * Convert mt5 order types to our own.
   * @param type the type coming from mt5
   */
  #toOrderType(type: string) {
    switch (type) {
      case 'OP_BUY_LIMIT':
        return OrderType.BUY_LIMIT;
      case 'OP_SELL_LIMIT':
        return OrderType.SELL_LIMIT;
      case 'OP_BUY_STOP':
        return OrderType.BUY_STOP;
      case 'OP_SELL_STOP':
        return OrderType.SELL_STOP;
      case 'OP_BUY_STOP_LIMIT':
        return OrderType.BUY_STOP_LIMIT;
      case 'OP_SELL_STOP_LIMIT':
        return OrderType.SELL_STOP_LIMIT;

      default:
        throw new UnprocessableResponseException('order type', type);
    }
  }
}
