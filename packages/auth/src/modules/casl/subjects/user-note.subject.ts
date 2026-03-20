export class UserNoteSubject {
  id: string;
  userId: string;
  companyId: string;

  constructor(input: UserNoteSubject) {
    this.id = input.id;
    this.userId = input.userId;
    this.companyId = input.companyId;
  }
}
