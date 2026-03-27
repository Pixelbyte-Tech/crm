export interface TradingAccountDeletedDto {
  /** The trading account id */
  tradingAccountId: string;
  /** The timestamp in (UTC millisecond timestamp) */
  deletedAt: number;
}
