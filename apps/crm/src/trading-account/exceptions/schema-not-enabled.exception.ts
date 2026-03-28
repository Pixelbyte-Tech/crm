import { DomainException } from '../../common/exceptions';

export class SchemaNotEnabledException extends DomainException {
  constructor(schemaName: string, cause?: Error) {
    super(`Schema '${schemaName}' is disabled and does not allow new accounts.`, cause);
  }
}
