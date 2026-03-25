import { DomainException } from '../../common/exceptions';

export class UnknownPlatformException extends DomainException {
  constructor(name: string, cause?: Error) {
    super(`Unknown platform '${name}'.`, cause);
  }
}
