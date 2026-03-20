export class TradingAccountSubject {
  id: string;
  userId: string;
  companyId: string;

  constructor(input: TradingAccountSubject) {
    this.id = input.id;
    this.userId = input.userId;
    this.companyId = input.companyId;
  }
}
