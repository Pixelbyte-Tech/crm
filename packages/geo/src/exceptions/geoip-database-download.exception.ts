import { DomainException } from './domain.exception';

export class GeoipDatabaseDownloadException extends DomainException {
  constructor(readonly cause?: Error) {
    super(`Unable to download the GeoIP database.`, cause);
    this.setHttpStatus(500);
  }
}
