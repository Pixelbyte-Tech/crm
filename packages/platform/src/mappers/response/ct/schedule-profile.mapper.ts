import { Injectable } from '@nestjs/common';

import { TradingSession, TradingSessions } from '../../../models/trading-session';

import { getTimezoneOffset } from '../../../utils/time.utils';
import { ProtoScheduleProfile } from '../../../services/ct/manager/proto/base/ts';

@Injectable()
export class ScheduleProfileMapper {
  /**
   * Converts a set of ProtoScheduleProfile to a TradingSessions object
   * @param profile The profile to obtain the sessions from
   */
  toTradingSessions(profile: ProtoScheduleProfile): TradingSessions {
    return new TradingSessions({
      Sun: this.#mapSessions(profile, 0),
      Mon: this.#mapSessions(profile, 1),
      Tue: this.#mapSessions(profile, 2),
      Wed: this.#mapSessions(profile, 3),
      Thu: this.#mapSessions(profile, 4),
      Fri: this.#mapSessions(profile, 5),
      Sat: this.#mapSessions(profile, 6),
    });
  }

  /**
   * Maps the profiles to a list of TradingSession objects for a particular day
   * @param profile The profile to obtain the sessions from
   * @param day The day to filter the profiles by
   */
  #mapSessions(profile: ProtoScheduleProfile, day: number): TradingSession[] {
    // Get the timezone offset
    let offsetSec = 0;
    if (profile.scheduleTimeZone && 'UTC' !== profile.scheduleTimeZone.toUpperCase()) {
      offsetSec = getTimezoneOffset('Africa/Asmara') * 60;
    }

    // Number of seconds in a day
    const secInDay = 86400;

    // Find the range of seconds for the day
    const dayStart = day * secInDay;
    const dayEnd = dayStart + secInDay - 1;

    // Find the relevant intervals which start or end in the day
    let intervals =
      profile.interval?.filter((i) => {
        let startSec = i.startSecond - offsetSec;
        let endSec = i.endSecond - offsetSec;

        // Wrap the seconds around the week if needed
        if (endSec < 0) {
          endSec += secInDay * 7;
        }
        if (endSec > secInDay * 7) {
          endSec -= secInDay * 7;
        }
        if (startSec < 0) {
          startSec += secInDay * 7;
        }
        if (startSec > secInDay * 7) {
          startSec -= secInDay * 7;
        }

        return (
          (startSec >= dayStart && startSec <= dayEnd) || // starts in day
          (endSec >= dayStart && endSec <= dayEnd) // ends in day
        );
      }) || [];

    // Sort the intervals by start time ascending
    intervals = intervals.sort((a, b) => a.startSecond - b.startSecond);

    // Prepare the sessions list
    const sessions: TradingSession[] = [];

    // Map the intervals to TradingSession objects
    for (const interval of intervals) {
      // Get the start/end times relative to the dat
      const start = interval.startSecond - offsetSec - dayStart;
      const end = interval.endSecond - offsetSec - dayStart;

      const hmsStart = this.#secondsToHms(Math.max(start, 0));
      const hmsEnd = this.#secondsToHms(Math.min(end, 86400 - 1));

      sessions.push({
        openHour: hmsStart.h,
        openMinute: hmsStart.m,
        closeHour: hmsEnd.h,
        closeMinute: hmsEnd.m,
      });
    }

    return sessions;
  }

  /**
   * Converts seconds to hours, minutes, and seconds
   * @param seconds The seconds to convert
   */
  #secondsToHms(seconds: number): { h: number; m: number; s: number } {
    seconds = Number(seconds);
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor((seconds % 3600) % 60);

    return { h, m, s };
  }
}
