import { Platform, Monetisation, TradingAccountStatus } from '@crm/types';

export interface TradingAccountCreatedDto {
  /** The trading account id */
  tradingAccountId: string;
  /** The id of the user the trading account belongs to */
  userId: string;
  /** The id of the schema used by the trading account */
  schemaId?: string;
  /** The id of the server the trading account exists on */
  serverId: string;
  /** The id of the trading account on the platform */
  platformId: string;
  /** The id of the user on the platform who owns the trading account */
  platformUserId?: string;
  /** The name of the trading account on the platform */
  platformAccountName?: string;
  /** Friendly name for the trading account */
  friendlyName?: string;
  /** The platform the trading account exists on */
  platform: Platform;
  /** The monetisation */
  monetisation: Monetisation;
  /** The trading account status */
  status: TradingAccountStatus;
  /** The leverage on the platform */
  leverage: number;
  /** The trading account currency */
  currency: string;
  /** The registration timestamp in (UTC millisecond timestamp) */
  registeredAt: number;
  /** The login credential */
  login: string;
  /** The password credential */
  password: string;
  /** The timestamp in (UTC millisecond timestamp) */
  createdAt: number;
}
