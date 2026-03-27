import { Monetisation } from '@crm/types';

import { DomainException } from '../../common/exceptions';

export class MonetisationMismatchException extends DomainException {
  constructor(account: Monetisation, server: Monetisation, cause?: Error) {
    super(`Unable to create '${account}' account on a '${server}' server.`, cause);
  }
}
