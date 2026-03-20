export class UserDocumentSubject {
  id: string;
  userId: string;
  companyId: string;

  constructor(input: UserDocumentSubject) {
    this.id = input.id;
    this.userId = input.userId;
    this.companyId = input.companyId;
  }
}
