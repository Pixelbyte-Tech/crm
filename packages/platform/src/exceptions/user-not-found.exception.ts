import { PlatformException } from './platform.exception';

export class UserNotFoundException extends PlatformException {
  constructor(
    readonly platformUserId: unknown,
    cause?: unknown,
  ) {
    super(`User with platformUserId '${platformUserId}' does not exist on the platform server.`, cause);
  }
}
