import { PlatformException } from './platform.exception';

export class DuplicateAccountIdException extends PlatformException {
  constructor(
    readonly accountId: unknown,
    cause?: unknown,
  ) {
    super(`The platform account id '${accountId}' is already in use on the platform server`, cause);
  }
}
