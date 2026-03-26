import { Side } from '@crm/types';

export class OpenPositionDto {
  /** They side of position to open */
  side: Side;
  /** The symbol to open the position for */
  symbol: string;
  /** The number of lots to open */
  lots: number;
  /** A take profit amount to set on the position once it is opened */
  takeProfit?: number;
  /** A stop loss amount to set on the position once it is opened */
  stopLoss?: number;
  /** Any comment to assign to the position when opened */
  comment?: string;

  constructor(data: OpenPositionDto) {
    this.side = data.side;
    this.symbol = data.symbol;
    this.lots = data.lots;
    this.takeProfit = data.takeProfit;
    this.stopLoss = data.stopLoss;
    this.comment = data.comment;
  }
}
