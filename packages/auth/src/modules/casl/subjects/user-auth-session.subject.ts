export class UserAuthSessionSubject {
  id: string;
  userId: string;
  companyId: string;

  constructor(input: UserAuthSessionSubject) {
    this.id = input.id;
    this.userId = input.userId;
    this.companyId = input.companyId;
  }
}
