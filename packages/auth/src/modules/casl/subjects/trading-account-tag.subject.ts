export class TradingAccountTagSubject {
  id: string;
  companyId: string;

  constructor(input: TradingAccountTagSubject) {
    this.id = input.id;
    this.companyId = input.companyId;
  }
}
