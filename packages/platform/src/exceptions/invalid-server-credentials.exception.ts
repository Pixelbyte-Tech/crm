import { PlatformException } from './platform.exception';

export class InvalidServerCredentialsException extends PlatformException {
  constructor(serverBaseUrl: string, cause?: unknown) {
    super(`The credentials used with '${serverBaseUrl}' are not valid.`, cause);
  }
}
