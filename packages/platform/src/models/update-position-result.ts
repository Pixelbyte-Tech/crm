export class UpdatePositionResult {
  /** The take profit amount on the position */
  takeProfit?: number;

  /** The stop loss amount on the position */
  stopLoss?: number;

  constructor(data: UpdatePositionResult) {
    this.takeProfit = data.takeProfit;
    this.stopLoss = data.stopLoss;
  }
}
