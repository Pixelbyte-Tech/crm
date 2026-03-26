import { TradingSessions } from './trading-session';

export class Symbol {
  /** The name of the symbol on the trading platform, e.g. ETHUSD */
  name: string;

  /** The description of the symbol */
  description: string;

  /** The security type of the symbol */
  security?: string;

  /** The base currency of the symbol */
  base?: string;

  /** The quote currency of the symbol */
  quote?: string;

  /** The spread amount when buying */
  spreadBuy: number;

  /** The spread amount when selling */
  spreadSell: number;

  /** The contract size of the symbol */
  contractSize: number;

  /** The minimum volume allowed when opening a position */
  minVolume: number;

  /** The maximum volume allowed when opening a position */
  maxVolume: number;

  /** Defined as 1/10^digits */
  pointValue: number;

  /** The number of decimal places the symbol supports */
  digits: number;

  /** The datetime(s) during which the symbol is available for trading */
  tradingSession?: TradingSessions;

  constructor(data: Symbol) {
    this.name = data.name;
    this.description = data.description;
    this.security = data.security;
    this.base = data.base;
    this.quote = data.quote;
    this.spreadBuy = data.spreadBuy;
    this.spreadSell = data.spreadSell;
    this.contractSize = data.contractSize;
    this.minVolume = data.minVolume;
    this.maxVolume = data.maxVolume;
    this.pointValue = data.pointValue;
    this.digits = data.digits;
    this.tradingSession = data.tradingSession;
  }
}
