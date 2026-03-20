export class LoyaltyHistorySubject {
  id: string;
  userId: string;
  companyId: string;

  constructor(input: LoyaltyHistorySubject) {
    this.id = input.id;
    this.userId = input.userId;
    this.companyId = input.companyId;
  }
}
