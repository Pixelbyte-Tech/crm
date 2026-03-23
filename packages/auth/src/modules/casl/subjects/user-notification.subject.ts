export class UserNotificationSubject {
  userId: string;

  constructor(input?: UserNotificationSubject) {
    if (input) {
      this.userId = input.userId;
    }
  }
}
