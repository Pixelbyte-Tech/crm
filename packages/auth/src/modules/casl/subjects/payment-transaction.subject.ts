export class PaymentTransactionSubject {
  id: string;
  userId: string;
  companyId: string;

  constructor(input: PaymentTransactionSubject) {
    this.id = input.id;
    this.userId = input.userId;
    this.companyId = input.companyId;
  }
}
