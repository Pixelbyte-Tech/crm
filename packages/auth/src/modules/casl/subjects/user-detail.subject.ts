export class UserDetailSubject {
  userId: string;

  constructor(input?: UserDetailSubject) {
    if (input) {
      this.userId = input.userId;
    }
  }
}
