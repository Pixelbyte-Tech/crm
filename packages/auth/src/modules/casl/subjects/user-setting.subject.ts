export class UserSettingSubject {
  id: string;
  userId: string;
  companyId: string;

  constructor(input: UserSettingSubject) {
    this.id = input.id;
    this.userId = input.userId;
    this.companyId = input.companyId;
  }
}
