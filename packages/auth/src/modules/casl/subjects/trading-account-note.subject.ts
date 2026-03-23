export class TradingAccountNoteSubject {
  authorId: string;

  constructor(input?: TradingAccountNoteSubject) {
    if (input) {
      this.authorId = input.authorId;
    }
  }
}
