import { DomainException } from '../../common/exceptions';

export class SchemaConflictException extends DomainException {
  constructor(schemaName: string, mismatch: string, cause?: Error) {
    super(`Trading account conflicts with schema '${schemaName}' on ${mismatch}.`, cause);
  }
}
