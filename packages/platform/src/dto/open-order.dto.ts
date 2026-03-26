import { OrderType } from '@crm/types';

export class OpenOrderDto {
  /** The type of order to open */
  type: OrderType;
  /** The price at which to open the order */
  triggerPrice: number;
  /** The symbol to open the order for */
  symbol: string;
  /** The number of lots to open after the order is triggered */
  lots: number;
  /** A take profit amount to set on the position once it is opened */
  takeProfit?: number;
  /** A stop loss amount to set on the position once it is opened */
  stopLoss?: number;
  /** An optional comment to add to the order */
  comment?: string;
  /** The date at which the order expires */
  expiresAt?: string;

  constructor(data: OpenOrderDto) {
    this.type = data.type;
    this.triggerPrice = data.triggerPrice;
    this.symbol = data.symbol;
    this.lots = data.lots;
    this.takeProfit = data.takeProfit;
    this.stopLoss = data.stopLoss;
    this.comment = data.comment;
    this.expiresAt = data.expiresAt;
  }
}
