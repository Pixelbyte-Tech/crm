export class UserSubject {
  id: string;

  constructor(input?: UserSubject) {
    if (input) {
      this.id = input.id;
    }
  }
}
