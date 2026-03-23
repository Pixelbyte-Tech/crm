export class UserAvatarSubject {
  userId: string;

  constructor(input?: UserAvatarSubject) {
    if (input) {
      this.userId = input.userId;
    }
  }
}
