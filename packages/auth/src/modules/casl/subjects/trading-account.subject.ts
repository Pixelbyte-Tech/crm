export class TradingAccountSubject {
  userId: string;

  constructor(input?: TradingAccountSubject) {
    if (input) {
      this.userId = input.userId;
    }
  }
}
