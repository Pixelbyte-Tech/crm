import { PlatformException } from './platform.exception';

export class UnavailablePlatformServerException extends PlatformException {
  constructor(url: string, cause?: unknown) {
    super(`The platform server at '${url}' is currently not available.`, cause);
  }
}
