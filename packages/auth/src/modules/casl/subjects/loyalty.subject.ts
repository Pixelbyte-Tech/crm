export class LoyaltySubject {
  userId: string;

  constructor(input?: LoyaltySubject) {
    if (input) {
      this.userId = input.userId;
    }
  }
}
