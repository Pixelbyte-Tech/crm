export class AuditLogSubject {
  id: string;
  companyId: string;

  constructor(input: AuditLogSubject) {
    this.id = input.id;
    this.companyId = input.companyId;
  }
}
