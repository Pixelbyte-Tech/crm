export class TradingAccountNoteSubject {
  id: string;
  authorUserId: string;
  companyId: string;

  constructor(input: TradingAccountNoteSubject) {
    this.id = input.id;
    this.authorUserId = input.authorUserId;
    this.companyId = input.companyId;
  }
}
