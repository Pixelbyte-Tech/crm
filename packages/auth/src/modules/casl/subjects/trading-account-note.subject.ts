export class TradingAccountNoteSubject {
  id: string;
  authorId: string;
  companyId: string;

  constructor(input: TradingAccountNoteSubject) {
    this.id = input.id;
    this.authorId = input.authorId;
    this.companyId = input.companyId;
  }
}
