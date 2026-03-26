import { PlatformException } from './platform.exception';

export class UserNotFoundException extends PlatformException {
  constructor(
    readonly brandUserId: unknown,
    cause?: unknown,
  ) {
    super(`User with brandUserId '${brandUserId}' does not exist on the platform server.`, cause);
  }
}
