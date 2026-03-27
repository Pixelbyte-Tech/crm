export class Balance {
  balance: number;
  equity: number;
  availableMargin: number;
  totalMargin: number;
  withdrawable: number;

  constructor(data?: Balance) {
    if (data) {
      this.balance = data.balance;
      this.equity = data.equity;
      this.availableMargin = data.availableMargin;
      this.totalMargin = data.totalMargin;
      this.withdrawable = data.withdrawable;
    }
  }
}
