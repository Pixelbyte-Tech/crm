export class WalletSubject {
  id: string;
  userId: string;
  companyId: string;

  constructor(input: WalletSubject) {
    this.id = input.id;
    this.userId = input.userId;
    this.companyId = input.companyId;
  }
}
