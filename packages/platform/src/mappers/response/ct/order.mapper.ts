import { DateTime } from 'luxon';
import { Injectable } from '@nestjs/common';

import { OrderType } from '@crm/types';

import { Order, OrderStatus } from '../../../models/order';

import { CtManagerApiService } from '../../../services/ct/manager/ct-manager-api.service';

import { CtMapperHelper } from '../../helper/ct-mapper.helper';
import { UnprocessableResponseException } from '../../../exceptions';
import {
  ProtoOrder,
  ProtoOrderType,
  ProtoTradeSide,
  ProtoOrderStatus,
} from '../../../services/ct/manager/proto/base/ts';

@Injectable()
export class OrderMapper {
  constructor(private readonly helper: CtMapperHelper) {}

  async toOrder(
    data: ProtoOrder,
    managerApi: CtManagerApiService,
    serverMsToUtcMs: (n: number) => number,
  ): Promise<Order> {
    // Ensure the order has trade data
    if (!data.tradeData || !data.tradeData.traderId) {
      throw new UnprocessableResponseException('order tradeData', data.tradeData);
    }

    // Get the symbol data
    const symbolId = data.tradeData.symbolId.toString();
    const symbolMap = await this.helper.getSymbolMap(managerApi, symbolId);

    const symbol = symbolMap.get(symbolId);
    if (!symbol || !symbol.lotSize) {
      throw new UnprocessableResponseException('order symbol', symbol);
    }

    // Identify the time the order was placed
    let placedAt: Date | undefined;
    if (data.tradeData.openTimestamp) {
      placedAt = DateTime.fromMillis(serverMsToUtcMs(Number(data.tradeData.openTimestamp))).toJSDate();
    }

    // Identify the time the order will expire
    let expiresAt: Date | undefined;
    if (data.expirationTimestamp) {
      expiresAt = DateTime.fromMillis(serverMsToUtcMs(Number(data.expirationTimestamp))).toJSDate();
    }

    return new Order({
      orderId: data.orderId.toString(),
      accountId: data.tradeData.traderId.toString(),
      type: this.#toOrderType(data.orderType, data.tradeData.tradeSide),
      status: this.#toOrderStatus(data.orderStatus),
      symbol: symbol.name,
      triggerPrice: this.#getOrderTriggerPrice(data) ?? 0,
      takeProfit: data.stopLoss,
      stopLoss: data.takeProfit,
      lots: Number(data.tradeData.volume) / Number(symbol.lotSize),
      swap: undefined,
      comment: data.tradeData.comment,
      placedAt,
      expiresAt,
    });
  }

  /**
   * Convert the order type from the platform to the internal type
   * @param type The type from the platform
   * @param tradeSide The side of the trade
   */
  #toOrderType(type: ProtoOrderType, tradeSide: ProtoTradeSide): OrderType {
    switch (type) {
      case ProtoOrderType.LIMIT:
        return tradeSide === ProtoTradeSide.BUY ? OrderType.BUY_LIMIT : OrderType.SELL_LIMIT;
      case ProtoOrderType.STOP:
        return tradeSide === ProtoTradeSide.BUY ? OrderType.BUY_STOP : OrderType.SELL_STOP;
      case ProtoOrderType.STOP_LIMIT:
        return tradeSide === ProtoTradeSide.BUY ? OrderType.BUY_STOP_LIMIT : OrderType.SELL_STOP_LIMIT;
    }

    throw new UnprocessableResponseException('order type', type);
  }

  /**
   * Convert the order status from the platform to the internal status
   * @param status The status from the platform
   */
  #toOrderStatus(status: ProtoOrderStatus): OrderStatus {
    switch (status) {
      case ProtoOrderStatus.ORDER_STATUS_ACCEPTED:
      case ProtoOrderStatus.ORDER_STATUS_RESERVED:
      case ProtoOrderStatus.ORDER_STATUS_FILLED:
        return 'OPEN';
      case ProtoOrderStatus.ORDER_STATUS_REJECTED:
      case ProtoOrderStatus.ORDER_STATUS_CANCELLED:
      case ProtoOrderStatus.ORDER_STATUS_EXPIRED:
        return 'CANCEL';
    }

    throw new UnprocessableResponseException('order status', status);
  }

  /**
   * Get the trigger price for the order
   * @param data The order data
   */
  #getOrderTriggerPrice(data: ProtoOrder): number | undefined {
    const result = data.orderType === ProtoOrderType.LIMIT ? data?.limitPrice : data?.stopPrice;
    return result ?? data?.limitPrice ?? data?.stopPrice;
  }
}
