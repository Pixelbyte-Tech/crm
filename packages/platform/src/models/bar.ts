export enum BarTimeframe {
  ONE_MINUTE = '1m',
  FIVE_MINUTES = '5m',
  FIFTEEN_MINUTES = '15m',
  THIRTY_MINUTES = '30m',
  ONE_HOUR = '1h',
  FOUR_HOURS = '4h',
  ONE_DAY = '1d',
  ONE_WEEK = '1w',
  ONE_MONTH = '1mn',
}

export class Bar {
  /** The symbol the bar belongs to */
  s: string;
  /** The open price */
  op: number;
  /** The open time in unix seconds */
  ot: number;
  /** The close price */
  cp: number;
  /** The close time of the bar in unix seconds */
  ct: number;
  /** The highest price */
  h: number;
  /** The lowest price */
  l: number;
  /** The total volume traded during the timeframe */
  v: number;
  /** The timeframe of the bar */
  t: BarTimeframe;

  constructor(data: Bar) {
    this.s = data.s;
    this.op = data.op;
    this.ot = data.ot;
    this.cp = data.cp;
    this.ct = data.ct;
    this.h = data.h;
    this.l = data.l;
    this.v = data.v;
    this.t = data.t;
  }
}
