export class UserNoteSubject {
  userId: string;

  constructor(input?: UserNoteSubject) {
    if (input) {
      this.userId = input.userId;
    }
  }
}
