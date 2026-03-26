import { InternalServerErrorException } from '@nestjs/common';

/**
 * Returns the offset in minutes for a given timezone from UTC.
 * @param timeZone The timezone to get the offset for.
 * @param offsetHours Any additional offset in hours to apply to the timezone.
 */
export function getTimezoneOffset(timeZone: string, offsetHours?: number): number {
  try {
    const utcDate = new Date(new Date().toLocaleString('en-US', { timeZone: 'UTC' }));
    const tzDate = new Date(new Date().toLocaleString('en-US', { timeZone }));
    const offset = (tzDate.getTime() - utcDate.getTime()) / 6e4;

    return offset + (offsetHours ?? 0) * 60;
  } catch (err) {
    throw new InternalServerErrorException(err, `Invalid timezone '${timeZone}'.`);
  }
}
