export class BillingInfoSubject {
  id: string;
  companyId: string;

  constructor(input: BillingInfoSubject) {
    this.id = input.id;
    this.companyId = input.companyId;
  }
}
