export class UserCompanySubject {
  id: string;
  userId: string;
  companyId: string;

  constructor(input: UserCompanySubject) {
    this.id = input.id;
    this.userId = input.userId;
    this.companyId = input.companyId;
  }
}
