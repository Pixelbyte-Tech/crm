export class TradingAccountNoteSubject {
  id: string;
  companyId: string;

  constructor(input: TradingAccountNoteSubject) {
    this.id = input.id;
    this.companyId = input.companyId;
  }
}
