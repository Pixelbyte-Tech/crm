export class WalletSubject {
  userId: string;

  constructor(input?: WalletSubject) {
    if (input) {
      this.userId = input.userId;
    }
  }
}
