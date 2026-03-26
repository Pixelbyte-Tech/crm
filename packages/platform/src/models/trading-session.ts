export class TradingSession {
  /** The hour the session opens in UTC time */
  openHour: number;

  /** The minute the session opens in UTC time */
  openMinute: number;

  /** The hour the session closes in UTC time */
  closeHour: number;

  /** The minute the session closes in UTC time */
  closeMinute: number;

  constructor(data: TradingSession) {
    this.openHour = data.openHour;
    this.openMinute = data.openMinute;
    this.closeHour = data.closeHour;
    this.closeMinute = data.closeMinute;
  }
}

export class TradingSessions {
  /** The trading sessions for Monday. */
  Mon: TradingSession[];

  /** The trading sessions for Tuesday. */
  Tue: TradingSession[];

  /** The trading sessions for Wednesday. */
  Wed: TradingSession[];

  /** The trading sessions for Thursday. */
  Thu: TradingSession[];

  /** The trading sessions for Friday. */
  Fri: TradingSession[];

  /** The trading sessions for Saturday. */
  Sat: TradingSession[];

  /** The trading sessions for Sunday. */
  Sun: TradingSession[];

  constructor(data: TradingSessions) {
    this.Mon = data.Mon;
    this.Tue = data.Tue;
    this.Wed = data.Wed;
    this.Thu = data.Thu;
    this.Fri = data.Fri;
    this.Sat = data.Sat;
    this.Sun = data.Sun;
  }
}
