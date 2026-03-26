import { PlatformException } from './platform.exception';

export class UnsupportedOperationException extends PlatformException {
  constructor(platform: string) {
    super(`The requested operation is not currently supported for the ${platform} platform.`);
  }
}
