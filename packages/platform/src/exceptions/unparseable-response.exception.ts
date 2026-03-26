import { PlatformException } from './platform.exception';

export class UnparseableResponseException extends PlatformException {
  constructor(type?: string | null, reason?: string | null, cause?: unknown) {
    let message = `Failed to parse`;
    if (type) {
      message += ` '${type}'`;
    }
    message += ' response from trading platform';
    if (reason) {
      message += ` due to '${reason}'`;
    }

    super(message, cause);
  }
}
