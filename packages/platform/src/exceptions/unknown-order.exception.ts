import { PlatformException } from './platform.exception';

export class UnknownOrderException extends PlatformException {
  constructor(
    readonly orderId: unknown,
    cause?: unknown,
  ) {
    super(`Order with Id '${orderId}' does not exist on the platform server.`, cause);
  }
}
