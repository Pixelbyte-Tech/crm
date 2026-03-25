import { DomainException } from '../../common/exceptions';

export class UnknownIntegrationNameException extends DomainException {
  constructor(name: string, cause?: Error) {
    super(`Unknown integration '${name}'.`, cause);
  }
}
