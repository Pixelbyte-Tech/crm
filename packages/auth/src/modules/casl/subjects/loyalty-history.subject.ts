export class LoyaltyHistorySubject {
  userId: string;

  constructor(input?: LoyaltyHistorySubject) {
    if (input) {
      this.userId = input.userId;
    }
  }
}
