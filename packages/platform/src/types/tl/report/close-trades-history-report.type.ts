export interface TlCloseTradesHistoryReport {
  instrument: string;
  lotSize: string;
  accountId: string;
  userGroupId: string;
  openMilliseconds: string;
  openDateTime: string;
  orderType:
    | 'MARKET'
    | 'PROTECTIVE_STOP'
    | 'STOP_LOSS'
    | 'STOP'
    | 'STOP_OUT'
    | 'PROTECTIVE_LIMIT'
    | 'TAKE_PROFIT'
    | 'LIMIT'
    | 'STOP_LIMIT'
    | 'TRAILING_STOP_LOSS'
    | 'TRAILING_STOP';
  side: 'BUY' | 'SELL';
  closeAmount: string;
  averageOpenPrice: string;
  closePrice: string;
  closeMilliseconds: string;
  closeDateTime: string;
  openAmount: string;
  closeTradeId: string;
  openTradeId: string;
  closeOrderId: string;
  positionId: string;
  openOrderId: string;
  strategyId: string;
  slPrice: string;
  slOrderType: 'STOP';
  slTrailingOffset: string;
  tpPrice: string;
  commission: string;
  swap: string;
  profit: string;
  netProfit: string;
}
