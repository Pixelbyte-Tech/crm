export class WalletTransactionHistorySubject {
  id: string;
  userId: string;
  companyId: string;

  constructor(input: WalletTransactionHistorySubject) {
    this.id = input.id;
    this.userId = input.userId;
    this.companyId = input.companyId;
  }
}
