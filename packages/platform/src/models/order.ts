import { OrderType } from '@crm/types';

export type OrderStatus = 'OPEN' | 'CANCEL';

export class Order {
  /** The id of the order on the platform */
  orderId: string;

  /** The id of the account on the platform */
  accountId: string;

  /** The symbol the order is on */
  symbol: string;

  /** The price the order is set to trigger at */
  triggerPrice: number;

  /** The take profit amount which will be set if the order is triggered */
  takeProfit?: number;

  /** The stop loss amount which will be set if the order is triggered */
  stopLoss?: number;

  /** The amount of lots to open */
  lots: number;

  /** The total swap fees incurred */
  swap?: number;

  /** Any comment present on the order */
  comment?: string;

  /** The type of order */
  type: OrderType;

  /** The status of the order */
  status: OrderStatus;

  /** The datetime when the order was placed */
  placedAt?: Date;

  /** The datetime when the order will expire */
  expiresAt?: Date;

  constructor(data: Order) {
    this.orderId = data.orderId;
    this.accountId = data.accountId;
    this.symbol = data.symbol;
    this.triggerPrice = data.triggerPrice;
    this.takeProfit = data.takeProfit;
    this.stopLoss = data.stopLoss;
    this.lots = data.lots;
    this.swap = data.swap;
    this.comment = data.comment;
    this.type = data.type;
    this.status = data.status;
    this.placedAt = data.placedAt;
    this.expiresAt = data.expiresAt;
  }
}
