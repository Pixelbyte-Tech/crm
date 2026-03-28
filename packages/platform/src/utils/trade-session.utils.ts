import { TradingSession } from '../models';

export interface OffsetResult extends TradingSession {
  openDay: number;
  closeDay: number;
}

export function calcShift(day: number, hour: number, min: number, offset: number) {
  const shiftAmount = -offset;
  const originalMin = min;

  min += shiftAmount;
  const hourShift = Math.floor(min / 60);
  hour += hourShift;
  min = shiftAmount % 60 === 0 ? originalMin : Math.abs(min % 60);

  if (hour >= 24) {
    hour -= 24;
    day += 1;
  } else if (hour < 0) {
    hour += 24;
    day -= 1;
  }

  return { day, hour, min };
}

export function cleanSession(tradingSession: TradingSession): TradingSession {
  return {
    openHour: Math.floor(tradingSession.openHour),
    openMinute: Math.floor(tradingSession.openMinute),
    closeHour: Math.floor(tradingSession.closeHour),
    closeMinute: Math.floor(tradingSession.closeMinute),
  };
}

export function cleanDay(tradingSessions: TradingSession[]): TradingSession[] {
  // Sort the shifts by start time
  tradingSessions.sort((a, b) => {
    return a.openHour != b.openHour ? a.openHour - b.openHour : a.openMinute - b.openMinute;
  });

  // Iterate through the shifts and merge any that are connected
  for (let i = tradingSessions.length - 1; i >= 1; i--) {
    const currentShift = tradingSessions[i];
    const previousShift = tradingSessions[i - 1];
    if (previousShift.closeHour == currentShift.openHour && previousShift.closeMinute == currentShift.openMinute) {
      previousShift.closeHour = currentShift.closeHour;
      previousShift.closeMinute = currentShift.closeMinute;
      tradingSessions.splice(i, 1);
    }
  }

  return tradingSessions;
}

export function chunkResults(results: OffsetResult[]): OffsetResult[] {
  return results
    .map((w) => {
      if (w.openDay === w.closeDay) {
        return [w];
      }

      return [
        {
          openHour: 0,
          openMinute: 0,
          closeHour: w.closeHour,
          closeMinute: w.closeMinute,
          openDay: w.closeDay,
          closeDay: w.closeDay,
        },
        {
          openHour: w.openHour,
          openMinute: w.openMinute,
          closeHour: 23,
          closeMinute: 59,
          openDay: w.openDay,
          closeDay: w.openDay,
        },
      ];
    })
    .flat();
}
