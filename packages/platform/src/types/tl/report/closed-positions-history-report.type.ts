export interface TlClosedPositionsHistoryReport {
  instrument: string;
  accountId: string;
  closeTradeId: string;
  positionId: string;
  closeOrderId: string;
  openOrderId: string;
  durationSec: string;
  openDateTime: string;
  closeDateTime: string;
  profit: string;
  netProfit: string;
  commission: string;
  swap: string;
  amount: string;
  openPrice: string;
  closePrice: string;
  slPrice: string;
  tpPrice: string;
  side: 'BUY' | 'SELL';
  currency: string;
  userGroupId: string;
}
