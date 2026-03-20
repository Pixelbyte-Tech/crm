export class UserDetailSubject {
  id: string;
  userId: string;
  companyId: string;

  constructor(input: UserDetailSubject) {
    this.id = input.id;
    this.userId = input.userId;
    this.companyId = input.companyId;
  }
}
