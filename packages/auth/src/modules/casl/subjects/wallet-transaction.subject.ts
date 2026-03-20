export class WalletTransactionSubject {
  id: string;
  userId: string;
  companyId: string;

  constructor(input: WalletTransactionSubject) {
    this.id = input.id;
    this.userId = input.userId;
    this.companyId = input.companyId;
  }
}
