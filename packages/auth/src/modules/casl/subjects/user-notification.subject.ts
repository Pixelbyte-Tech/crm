export class UserNotificationSubject {
  id: string;
  userId: string;
  companyId: string;

  constructor(input: UserNotificationSubject) {
    this.id = input.id;
    this.userId = input.userId;
    this.companyId = input.companyId;
  }
}
