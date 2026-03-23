export class UserAuthSessionSubject {
  userId: string;

  constructor(input?: UserAuthSessionSubject) {
    if (input) {
      this.userId = input.userId;
    }
  }
}
