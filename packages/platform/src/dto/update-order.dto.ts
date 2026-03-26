export class UpdateOrderDto {
  /** The price at which to trigger the order */
  triggerPrice?: number;
  /** A take profit amount to set on the position once it is opened */
  takeProfit?: number;
  /** A stop loss amount to set on the position once it is opened */
  stopLoss?: number;
  /** The date at which the order expires */
  expiresAt?: string;

  constructor(data: UpdateOrderDto) {
    this.triggerPrice = data.triggerPrice;
    this.takeProfit = data.takeProfit;
    this.stopLoss = data.stopLoss;
    this.expiresAt = data.expiresAt;
  }
}
