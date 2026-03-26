export interface TlPosition {
  openTradeId: string;
  positionId: string;
  accountId: string;
  lots: string;
  lotSize: string;
  units: string;
  openDateTime: string; // format '2021-06-01T12:00:00.000Z';
  pnl: string;
  commission: string;
  swap: string;
  slPrice?: string;
  tpPrice?: string;
  openPrice: string;
  currentPrice: string;
  side: 'BUY' | 'SELL' | 'SHORT_SELL' | 'BUY_TO_COVER';
  instrument: string;
  strategyId?: string;
}
