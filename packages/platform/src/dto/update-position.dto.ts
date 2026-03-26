export class UpdatePositionDto {
  /** A take profit amount to set on the position once it is opened */
  takeProfit?: number;
  /** A stop loss amount to set on the position once it is opened */
  stopLoss?: number;

  constructor(data: UpdatePositionDto) {
    this.stopLoss = data.stopLoss;
    this.takeProfit = data.takeProfit;
  }
}
