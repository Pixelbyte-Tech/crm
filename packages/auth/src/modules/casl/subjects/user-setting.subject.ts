export class UserSettingSubject {
  userId: string;

  constructor(input?: UserSettingSubject) {
    if (input) {
      this.userId = input.userId;
    }
  }
}
