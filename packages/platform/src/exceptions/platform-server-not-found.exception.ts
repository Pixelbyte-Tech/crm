import { PlatformException } from './platform.exception';

export class PlatformServerNotFoundException extends PlatformException {
  constructor(
    readonly params: unknown,
    cause?: unknown,
  ) {
    super(`The platform server with the following criteria '${params}' does not exist.`, cause);
  }
}
