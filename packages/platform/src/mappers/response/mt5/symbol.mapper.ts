import { codes } from 'currency-codes';
import { Injectable } from '@nestjs/common';

import { getTimezoneOffset } from '@crm/utils';

import { Symbol, TradingSessions } from '../../../models';

import { Mt5Symbol, Mt5Session, Mt5SessionTime } from '../../../types/mt5/symbol/symbol.type';

import { cleanDay, calcShift, chunkResults, cleanSession, OffsetResult } from '../../../utils/trade-session.utils';

interface WeekDay extends Mt5SessionTime {
  day: number;
}

@Injectable()
export class SymbolMapper {
  /** ISO 4217 currency codes */
  #iso4217Codes = [...new Set(codes().concat(['BTC', 'BIT']))];

  toSymbol(data: Mt5Symbol, timezone: string, offset?: number): Symbol {
    const spread = Math.abs(data.spread) / 2;

    let quote: string | null = null;

    // Try to calculate the quote currency
    // Some symbols will be e.g. USDCAD.pro, where USD = base and CAD = quote
    if (data.symbol.startsWith(data.currencyBase)) {
      const [n] = data.symbol.replace(data.currencyBase, '').toUpperCase().split('.');
      quote = this.#iso4217Codes.includes(n) ? n : null;
    }

    // If the symbol is not a forex pair, use the currencyProfit field
    if (!quote) {
      quote = data.currencyProfit;
    }

    return new Symbol({
      name: data.symbol,
      description: data.description,
      security: this.toSecurity(data),
      base: data.currencyBase,
      quote: quote,
      spreadBuy: Math.abs(spread),
      spreadSell: -Math.abs(spread),
      contractSize: data.contractSize,
      minVolume: data.volumeMin,
      maxVolume: data.volumeMax,
      pointValue: data.point,
      digits: data.digits,
      tradingSession: this.toTradingSessions(data, timezone, offset),
    });
  }

  toSecurity(data: Mt5Symbol): string {
    return data.path.replace(`\\${data.symbol}`, '');
  }

  toTradingSessions(data: Mt5Symbol, timezone: string, offset?: number): TradingSessions {
    const results = this.#applyTimezoneOffset(
      this.#sanitizeSession(data.sessionsTrade),
      getTimezoneOffset(timezone, offset) ?? 0,
    );

    const chunked = chunkResults(results);

    return {
      Mon: cleanDay(chunked.filter((t) => [1, 7].includes(t.openDay)).map(cleanSession)),
      Tue: cleanDay(chunked.filter((t) => t.openDay === 2).map(cleanSession)),
      Wed: cleanDay(chunked.filter((t) => t.openDay === 3).map(cleanSession)),
      Thu: cleanDay(chunked.filter((t) => t.openDay === 4).map(cleanSession)),
      Fri: cleanDay(chunked.filter((t) => t.openDay === 5).map(cleanSession)),
      Sat: cleanDay(chunked.filter((t) => [-1, 6].includes(t.openDay)).map(cleanSession)),
      Sun: cleanDay(chunked.filter((t) => t.openDay === 0).map(cleanSession)),
    };
  }

  /**
   * Checks if the market is closed for the entire Mt5SessionTime
   * @param sessionTime The session to check
   * @private
   */
  #isMarketClosed(sessionTime: Mt5SessionTime) {
    return (
      sessionTime.closeHours === 0 &&
      sessionTime.closeMinutes === 0 &&
      sessionTime.openHours === 0 &&
      sessionTime.openMinutes === 0
    );
  }

  /**
   * Remove any hours that end and start in zero
   * Add the day id to the session (Sunday = 0, Monday = 1, ..., Saturday = 6)
   * @param sessions The sessions to sanitize
   */
  #sanitizeSession(sessions: Mt5Session): WeekDay[] {
    return Object.values(sessions)
      .map((s, i) =>
        s.filter((s: Mt5SessionTime) => !this.#isMarketClosed(s)).map((s: Mt5SessionTime) => ({ ...s, day: i })),
      )
      .flat();
  }

  /**
   * Applies the timezone offset to the open and close times of the weekdays.
   * @param weekDays The weekdays to apply the offset to.
   * @param offset The timezone offset in minutes to apply.
   */
  #applyTimezoneOffset(weekDays: WeekDay[], offset: number): OffsetResult[] {
    const result: OffsetResult[] = [];

    for (const wd of weekDays) {
      // Shift the open and close times by the offset amount
      const shiftedOpen = calcShift(wd.day, wd.openHours, wd.openMinutes, offset);
      const shiftedClose = calcShift(wd.day, wd.closeHours, wd.closeMinutes, offset);

      result.push({
        openHour: shiftedOpen.hour,
        openMinute: shiftedOpen.min,
        closeHour: shiftedClose.hour,
        closeMinute: shiftedClose.min,
        openDay: shiftedOpen.day,
        closeDay: shiftedClose.day,
      });
    }

    return result;
  }
}
