export class Tick {
  /** The price a buyer is willing to pay */
  bid: number;
  /** The price a seller is willing to accept */
  ask: number;
  /** The highest session price for the symbol */
  high?: number;
  /** The lowest session price for the symbol */
  low?: number;
  /** The total volume of the symbol traded */
  volume?: number;
  /** UNIX timestamp in milliseconds */
  timestamp: number;

  constructor(data: Tick) {
    this.bid = data.bid;
    this.ask = data.ask;
    this.high = data.high;
    this.low = data.low;
    this.volume = data.volume;
    this.timestamp = data.timestamp;
  }
}
