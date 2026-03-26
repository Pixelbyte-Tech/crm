import { PlatformException } from './platform.exception';

export class AccountCommissionGroupNotFoundException extends PlatformException {
  constructor(
    readonly accountId: string,
    cause?: unknown,
  ) {
    super(`Unable to find commission group for platform account with id '${accountId}'`, cause);
  }
}
