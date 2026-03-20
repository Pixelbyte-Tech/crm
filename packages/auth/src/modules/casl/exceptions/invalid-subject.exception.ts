import { DomainException } from './domain.exception';

export class InvalidSubjectException extends DomainException {
  constructor(subject: string, cause?: Error) {
    super(`Invalid subject ${subject}`, cause);
    this.setHttpStatus(500);
  }
}
