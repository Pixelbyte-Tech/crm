export class UserNoteSubject {
  userId: string;
  authorId: string;

  constructor(input?: UserNoteSubject) {
    if (input) {
      this.userId = input.userId;
      this.authorId = input.authorId;
    }
  }
}
