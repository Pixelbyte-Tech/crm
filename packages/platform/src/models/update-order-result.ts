export class UpdateOrderResult {
  /** The price at which to trigger the order */
  triggerPrice: number;

  /** The take profit to set on the position once it is opened */
  takeProfit?: number;

  /** The stop loss to set on the position once it is opened */
  stopLoss?: number;

  /** The date on which the order expires */
  expiresAt?: Date;

  constructor(dto: UpdateOrderResult) {
    this.triggerPrice = dto.triggerPrice;
    dto.takeProfit = dto?.takeProfit && dto.takeProfit > 0 ? dto.takeProfit : undefined;
    dto.stopLoss = dto?.stopLoss && dto.stopLoss > 0 ? dto.stopLoss : undefined;
    this.expiresAt = dto.expiresAt;
  }
}
