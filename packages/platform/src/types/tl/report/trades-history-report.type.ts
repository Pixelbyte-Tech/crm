export interface TlTradesHistoryReport {
  tradeId: string;
  orderId: string;
  accountId: string;
  side: 'BUY' | 'SELL';
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
  positionStatus: 'CLOSE' | 'OPEN' | 'INCREASE' | 'DECREASE';
  tradeDateTime: string;
  price: string;
  lots: string;
  instrument: string;
  positionId: string;
  pnl: string;
  executionFee: string;
  swap: string;
  netPnl: string;
  stopLoss: string;
  stopLossLimit: string;
  takeProfit: string;
  userGroupId: string;
  strategyId: string;
}
