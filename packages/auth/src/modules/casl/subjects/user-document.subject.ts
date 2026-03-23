export class UserDocumentSubject {
  userId: string;

  constructor(input?: UserDocumentSubject) {
    if (input) {
      this.userId = input.userId;
    }
  }
}
