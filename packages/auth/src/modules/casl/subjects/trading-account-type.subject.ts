export class TradingAccountTypeSubject {
  id: string;
  companyId: string;

  constructor(input: TradingAccountTypeSubject) {
    this.id = input.id;
    this.companyId = input.companyId;
  }
}
