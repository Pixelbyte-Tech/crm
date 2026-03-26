import { PlatformException } from './platform.exception';

export class CredentialsMismatchException extends PlatformException {
  constructor(
    readonly accountId?: string,
    cause?: unknown,
  ) {
    super('All accounts belonging to the same user on this platform server must share the same credentials.', cause);
  }
}
