export interface Mt5Account {
  login: number;
  currencyDigits: number;
  balance: number;
  credit: number;
  margin: number;
  marginFree: number;
  marginLevel: number;
  marginLeverage: number;
  profit: number;
  storage: number;
  commission: number;
  floating: number;
  equity: number;
  soActivation: number;
  soTime: number;
  soLevel: number;
  soEquity: number;
  soMargin: number;
  blockedCommission: number;
  blockedProfit: number;
  marginInitial: number;
  marginMaintenance: number;
  assets: number;
  liabilities: number;
}
