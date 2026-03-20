export class AuditLogSubject {
  id: string;
  userId?: string | null;
  companyId: string;

  constructor(input: AuditLogSubject) {
    this.id = input.id;
    this.userId = input.userId;
    this.companyId = input.companyId;
  }
}
