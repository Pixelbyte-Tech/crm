import { DateTime } from 'luxon';
import { Injectable } from '@nestjs/common';

import { getTimezoneOffset } from '@crm/utils';

import { TradingHoliday } from '../../../models/trading-holiday';

import { CtManagerApiService } from '../../../services/ct/manager/ct-manager-api.service';

import { CtMapperHelper } from '../../helper/ct-mapper.helper';
import { ProtoHoliday, ProtoManagerSymbol } from '../../../services/ct/manager/proto/base/ts';

@Injectable()
export class HolidayMapper {
  constructor(private readonly helper: CtMapperHelper) {}

  /**
   * Returns the trading holidays for a number of symbols
   * @param symbols The ProtoManagerSymbols to return the holidays for
   * @param managerApi The manager API client linked to the platform
   */
  async toTradingHolidays(symbols: ProtoManagerSymbol[], managerApi: CtManagerApiService): Promise<TradingHoliday[]> {
    // Prepare the holidays response
    const holidays: TradingHoliday[] = [];

    // Fetch all the holidays in the platform
    const allHolidays = await this.helper.getHolidayMap(managerApi);

    // Fetch all the holiday profiles in the platform
    const allProfiles = await this.helper.getHolidayProfileMap(managerApi);

    // Exit early if there are no holidays or profiles
    if (!allHolidays.size || !allProfiles.size || !symbols.length) {
      return holidays;
    }

    // Create a map of symbols by holiday profile id
    const symbolMap = new Map();
    for (const symbol of symbols) {
      if (!symbol.holidayProfileId) {
        continue;
      }

      const tmp = symbolMap.get(symbol.holidayProfileId.toString()) || [];
      if (!tmp.length) symbolMap.set(symbol.holidayProfileId.toString(), tmp);

      tmp.push(symbol.name);
    }

    for (const [profileId, symbols] of symbolMap.entries()) {
      const profile = allProfiles.get(profileId);
      if (!profile) {
        continue;
      }

      // Fetch each trading holiday
      for (const holidayId of profile.holidayId) {
        const holiday = allHolidays.get(holidayId.toString());
        if (!holiday) {
          continue;
        }

        holidays.push(this.#mapHolidays(holiday, symbols));
      }
    }

    return holidays;
  }

  /**
   * Maps a ProtoHoliday to a TradingHoliday object
   * @param holiday The ProtoHoliday to map
   * @param symbols Optional symbols to associate with the holiday
   */
  #mapHolidays(holiday: ProtoHoliday, symbols?: string[]): TradingHoliday {
    // Figure out the date of the holiday
    let date = DateTime.fromMillis(Number(holiday.holidayDate));

    // Do we need to convert the timezone?
    let offset = 0;
    if (holiday.scheduleTimeZone && 'UTC' !== holiday.scheduleTimeZone.toUpperCase()) {
      offset = getTimezoneOffset(holiday.scheduleTimeZone);
      date = date.minus({ minutes: offset });
    }

    return {
      platformHolidayId: holiday.holidayId.toString(),
      name: holiday.name,
      symbols: symbols?.sort(),
      timezone: holiday.scheduleTimeZone,
      from: date.plus({ seconds: holiday.startSecond }).toJSDate(),
      to: date.plus({ seconds: holiday.endSecond }).toJSDate(),
    };
  }
}
