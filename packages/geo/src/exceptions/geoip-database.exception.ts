import { DomainException } from './domain.exception';

export class GeoipDatabaseException extends DomainException {
  constructor(readonly cause?: Error) {
    super(`Unable to load the GeoIP database.`, cause);
    this.setHttpStatus(500);
  }
}
