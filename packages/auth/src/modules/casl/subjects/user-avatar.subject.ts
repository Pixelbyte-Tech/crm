export class UserAvatarSubject {
  id: string;
  userId: string;
  companyId: string;

  constructor(input: UserAvatarSubject) {
    this.id = input.id;
    this.userId = input.userId;
    this.companyId = input.companyId;
  }
}
