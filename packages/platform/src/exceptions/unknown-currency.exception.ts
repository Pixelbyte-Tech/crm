import { PlatformException } from './platform.exception';

export class UnknownCurrencyException extends PlatformException {
  constructor(
    readonly currency: unknown,
    cause?: unknown,
  ) {
    super(`Currency '${currency}' does not exist on the platform server.`, cause);
  }
}
