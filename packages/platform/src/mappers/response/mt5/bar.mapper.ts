import { Injectable } from '@nestjs/common';

import { Bar, BarTimeframe } from '../../../models/bar';
import { Mt5Candle } from '../../../types/mt5/candle/candle.type';

@Injectable()
export class BarMapper {
  toBars(symbol: string, data: Mt5Candle[]): Bar[] {
    const candles: Bar[] = [];
    data.forEach((item) => {
      candles.push({
        s: symbol,
        op: item.open,
        ot: item.datetime,
        cp: item.close,
        ct: item.datetime + 59,
        h: item.high,
        l: item.low,
        v: item.volume,
        t: BarTimeframe.ONE_MINUTE,
      } as Bar);
    });

    return candles;
  }
}
