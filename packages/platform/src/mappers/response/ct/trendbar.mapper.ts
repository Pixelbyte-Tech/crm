import { DateTime } from 'luxon';
import { Injectable } from '@nestjs/common';

import { CtManagerApiService } from '../../../services/ct/manager/ct-manager-api.service';

import { Bar, BarTimeframe } from '../../../models/bar';
import { CtMapperHelper } from '../../helper/ct-mapper.helper';
import { ProtoTrendbar } from '../../../services/ct/manager/proto/base/ts';

@Injectable()
export class TrendbarMapper {
  constructor(private readonly helper: CtMapperHelper) {}

  async toBar(data: ProtoTrendbar, symbol: string, managerApi: CtManagerApiService): Promise<Bar | undefined> {
    if (!data.low || !data.deltaOpen || !data.deltaClose || !data.deltaHigh || !data.utcTimestampInMinutes) {
      return undefined;
    }

    // Get the symbol ID
    const symbolId = (await this.helper.getSymbolIdsMap(managerApi, symbol)).get(symbol);
    if (!symbolId) {
      return undefined;
    }

    // Get the symbol data (digits)
    const map = await this.helper.getSymbolMap(managerApi, symbolId);
    const s = map.get(symbolId);
    if (!s) {
      return undefined;
    }

    // Find the open time of the bar (time from platform is in mins)
    const ts = DateTime.fromSeconds(data.utcTimestampInMinutes * 60);

    return new Bar({
      s: symbol,
      op: this.#toDigits((data.low.toNumber() + data.deltaOpen.toNumber()) / 100_000, s.digits),
      ot: ts.toSeconds(),
      cp: this.#toDigits((data.low.toNumber() + data.deltaClose.toNumber()) / 100_000, s.digits),
      ct: ts.toSeconds() + 59,
      h: this.#toDigits((data.low.toNumber() + data.deltaHigh.toNumber()) / 100_000, s.digits),
      l: this.#toDigits(data.low.toNumber() / 100_000, s.digits),
      v: data.volume?.toNumber(),
      t: BarTimeframe.ONE_MINUTE,
    });
  }

  async toBars(data: ProtoTrendbar[], symbol: string, managerApi: CtManagerApiService): Promise<Bar[]> {
    const result: Bar[] = [];
    for (const d of data) {
      const bar = await this.toBar(d, symbol, managerApi);
      if (bar) result.push(bar);
    }

    return result;
  }

  /**
   * Converts a number to a fixed number of digits
   * @param number The number to convert
   * @param digits The number of digits to keep
   */
  #toDigits(number: number, digits: number): number {
    return Number(number.toFixed(digits));
  }
}
