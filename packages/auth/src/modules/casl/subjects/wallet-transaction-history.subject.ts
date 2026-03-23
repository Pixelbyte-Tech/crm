export class WalletTransactionHistorySubject {
  userId: string;

  constructor(input?: WalletTransactionHistorySubject) {
    if (input) {
      this.userId = input.userId;
    }
  }
}
