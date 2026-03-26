import { PlatformException } from './platform.exception';

export class InvalidServerUrlException extends PlatformException {
  constructor(url: string, cause?: unknown) {
    super(`The platform server '${url}' does not have a valid URL.`, cause);
  }
}
