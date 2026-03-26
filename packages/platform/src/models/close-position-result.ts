import { Position } from './position';

export class ClosePositionResult {
  /** The ID of the position that was closed */
  platformPositionId: string;

  /** The ID of the trade that was executed */
  platformTradeId?: string;

  /** The price at which the position was closed */
  closePrice?: number;

  /** The datetime at which the position was closed */
  closedAt?: Date;

  /** The profit made from closing the position */
  profit?: number;

  /** The number of open lots remaining in the position */
  lotsRemaining: number;

  /** Any new position that was opened as a result of the close */
  opened?: Position;

  constructor(data: ClosePositionResult) {
    this.platformPositionId = data.platformPositionId;
    this.platformTradeId = data.platformTradeId;
    this.closePrice = data.closePrice;
    this.closedAt = data.closedAt;
    this.profit = data.profit;
    this.lotsRemaining = data.lotsRemaining;
    this.opened = data.opened;
  }
}
