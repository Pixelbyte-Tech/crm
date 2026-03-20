export class LoyaltySubject {
  id: string;
  userId: string;
  companyId: string;

  constructor(input: LoyaltySubject) {
    this.id = input.id;
    this.userId = input.userId;
    this.companyId = input.companyId;
  }
}
