import { DomainException } from './domain.exception';

export class GeoipLookupException extends DomainException {
  constructor(
    ip: string,
    readonly cause?: Error,
  ) {
    super(`Failed to lookup geo details for IP ${ip}`, cause);
    this.setHttpStatus(500);
  }
}
