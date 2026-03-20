export class UserSubject {
  id: string;
  companyId: string;

  constructor(input: UserSubject) {
    this.id = input.id;
    this.companyId = input.companyId;
  }
}
