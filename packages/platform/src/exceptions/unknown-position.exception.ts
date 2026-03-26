import { PlatformException } from './platform.exception';

export class UnknownPositionException extends PlatformException {
  constructor(
    readonly positionId: unknown,
    cause?: unknown,
  ) {
    super(`Position with Id '${positionId}' does not exist on the platform server.`, cause);
  }
}
