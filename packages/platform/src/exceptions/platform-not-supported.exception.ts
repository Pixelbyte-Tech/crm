import { Platform } from '@crm/types';

import { PlatformException } from './platform.exception';

export class PlatformNotSupportedException extends PlatformException {
  constructor(
    readonly platform: Platform | string,
    version?: number,
    cause?: unknown,
  ) {
    super(`The platform ${platform}${version ? ` (version ${version})` : ``} is not currently supported.`, cause);
  }
}
