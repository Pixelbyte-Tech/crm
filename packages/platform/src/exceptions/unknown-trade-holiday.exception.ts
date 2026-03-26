import { PlatformException } from './platform.exception';

export class UnknownTradeHolidayException extends PlatformException {
  constructor(holidayId: number, cause?: unknown) {
    super(`Trade holiday with ID ${holidayId} not found or does not exist on the platform server.`, cause);
  }
}
