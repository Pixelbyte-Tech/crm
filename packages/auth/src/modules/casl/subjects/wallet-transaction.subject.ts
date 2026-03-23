export class WalletTransactionSubject {
  userId: string;

  constructor(input?: WalletTransactionSubject) {
    if (input) {
      this.userId = input.userId;
    }
  }
}
