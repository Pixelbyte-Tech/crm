export class TradingHoliday {
  /** The unique identifier of the trading holiday on the trading platform */
  platformHolidayId?: string;

  /** The name of the trading holiday */
  name: string;

  /** The list of symbols to which the holiday applies. If not set, applies to all symbols */
  symbols?: string[];

  /** The timezone of the trading holiday */
  timezone: string;

  /** The start day/time of the holiday in the specified timezone */
  from: Date;

  /** The end day/time  of the holiday in the specified timezone */
  to: Date;

  /** The ISO code of the country where the trading holiday is observed. If not set applies to all countries */
  countryIso?: string;

  constructor(data: TradingHoliday) {
    this.platformHolidayId = data.platformHolidayId;
    this.name = data.name;
    this.symbols = data.symbols;
    this.timezone = data.timezone;
    this.from = data.from;
    this.to = data.to;
    this.countryIso = data.countryIso;
  }
}
