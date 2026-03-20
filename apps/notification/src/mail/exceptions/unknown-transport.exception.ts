import { DomainException } from '../../common/exceptions';

export class UnknownTransportException extends DomainException {
  constructor(transport: string, cause?: Error) {
    super(`The transport type '${transport}' is not supported.`, cause);
  }
}
