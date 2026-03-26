import { PlatformException } from './platform.exception';

export class UnknownLeverageException extends PlatformException {
  constructor(
    readonly leverage: unknown,
    cause?: unknown,
  ) {
    super(`Leverage '${leverage}' does not exist on the platform server.`, cause);
  }
}
