export class CompanyInvitationSubject {
  id: string;
  sentByUserId: string;
  companyId: string;

  constructor(input: CompanyInvitationSubject) {
    this.id = input.id;
    this.sentByUserId = input.sentByUserId;
    this.companyId = input.companyId;
  }
}
