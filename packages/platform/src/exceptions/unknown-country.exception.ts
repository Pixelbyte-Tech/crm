import { PlatformException } from './platform.exception';

export class UnknownCountryException extends PlatformException {
  constructor(
    readonly countryIso: unknown,
    cause?: unknown,
  ) {
    super(`Country with iso '${countryIso}' does not exist on the platform server.`, cause);
  }
}
