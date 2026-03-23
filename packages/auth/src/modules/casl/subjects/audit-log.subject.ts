export class AuditLogSubject {
  userId?: string | null;

  constructor(input?: AuditLogSubject) {
    if (input) {
      this.userId = input.userId;
    }
  }
}
