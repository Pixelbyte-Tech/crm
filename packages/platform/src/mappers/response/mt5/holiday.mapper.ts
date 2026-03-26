import { DateTime } from 'luxon';
import { Injectable } from '@nestjs/common';

import { TradingHoliday } from '../../../models/trading-holiday';
import { Mt5Holiday, Mt5HolidayMode } from '../../../types/mt5/symbol/holiday.type';

@Injectable()
export class HolidayMapper {
  toHoliday(data: Mt5Holiday, serverTimezone: string, symbols?: string[]): TradingHoliday | null {
    const { day, month, year, workFrom, workTo, mode } = data;

    if (mode !== Mt5HolidayMode.HOLIDAY_ENABLED) {
      return null;
    }

    let fromDt: DateTime;
    let toDt: DateTime;

    if (workFrom === 0 && workTo === 0) {
      fromDt = DateTime.fromObject({ day, month, year }).startOf('day');
      toDt = DateTime.fromObject({ day, month, year }).endOf('day');
    } else {
      fromDt = DateTime.fromObject({ day, month, year }).startOf('day').plus({ minutes: workFrom });
      toDt = DateTime.fromObject({ day, month, year }).startOf('day').plus({ minutes: workTo });
    }

    return {
      name: data.description,
      symbols: symbols?.sort(),
      timezone: serverTimezone,
      from: fromDt.toJSDate(),
      to: toDt.toJSDate(),
    };
  }
}
