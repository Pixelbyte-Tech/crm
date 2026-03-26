import { Side, PositionStatus } from '@crm/types';

export class Position {
  /** The datetime when the position was opened */
  openedAt?: Date;

  /** The datetime when the position was closed */
  closedAt?: Date;

  /** The account id on the platform */
  accountId: string;

  /** The position id on the platform */
  positionId: string;

  /** The trade id on the platform */
  tradeId?: string;

  /** The symbol the position is on */
  symbol: string;

  /** The price the position was opened at */
  openPrice: number;

  /** The price the position was closed at */
  closePrice?: number;

  /** The take profit price */
  takeProfit?: number;

  /** The stop loss price */
  stopLoss?: number;

  /** The amount of lots */
  lots: number;

  /** The total spread incurred */
  spread?: number;

  /** The total commission incurred */
  commission?: number;

  /** The total swap fees incurred */
  swap?: number;

  /** The account profit made from the position */
  profit?: number;

  /** The comment present on the position */
  comment?: string;

  /** The side of the position */
  side: Side;

  /** The status of the position */
  status: PositionStatus;

  constructor(data: Position) {
    this.openedAt = data.openedAt;
    this.closedAt = data.closedAt;
    this.accountId = data.accountId;
    this.positionId = data.positionId;
    this.tradeId = data.tradeId;
    this.symbol = data.symbol;
    this.openPrice = data.openPrice;
    this.closePrice = data.closePrice;
    this.takeProfit = data.takeProfit;
    this.stopLoss = data.stopLoss;
    this.lots = data.lots;
    this.spread = data.spread;
    this.commission = data.commission;
    this.swap = data.swap;
    this.profit = data.profit;
    this.comment = data.comment;
    this.side = data.side;
    this.status = data.status;
  }
}
