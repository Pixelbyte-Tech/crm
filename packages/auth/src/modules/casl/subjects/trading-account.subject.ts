export class TradingAccountSubject {
  id: string;
  userId: string;

  constructor(input?: TradingAccountSubject) {
    if (input) {
      this.id = input.id;
      this.userId = input.userId;
    }
  }
}
