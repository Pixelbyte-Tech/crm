export class TradingAccountTypeLeverageSubject {
  id: string;
  companyId: string;

  constructor(input: TradingAccountTypeLeverageSubject) {
    this.id = input.id;
    this.companyId = input.companyId;
  }
}
