export class PaymentTransactionSubject {
  userId: string;

  constructor(input?: PaymentTransactionSubject) {
    if (input) {
      this.userId = input.userId;
    }
  }
}
