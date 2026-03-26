import { ProtoTradeSide } from '../../../services/ct/manager/proto/base/ts';

export interface CtPosition {
  login: number;
  positionId: number;
  openTimestamp: Date;
  entryPrice: number;
  direction: ProtoTradeSide;
  volume: number;
  symbol: string;
  commission: number;
  swap: number;
  bookType: string;
  stake: number;
  spreadBetting: boolean;
  usedMargin: number;
}
