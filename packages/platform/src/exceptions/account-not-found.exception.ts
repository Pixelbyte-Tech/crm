import { PlatformException } from './platform.exception';

export class AccountNotFoundException extends PlatformException {
  constructor(
    readonly accountId: unknown,
    cause?: unknown,
  ) {
    super(`The platform account with id '${accountId}' does not exist.`, cause);
  }
}
