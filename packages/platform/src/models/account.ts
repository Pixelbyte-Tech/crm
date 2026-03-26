export class Account {
  /** The id of the account on the remote platform */
  platformAccountId: string;

  /** The currency of the account on the remote platform */
  currency: string;

  /** Whether the account is allowed to trade */
  isTradingAllowed: boolean;

  /** Whether the account is suspended */
  isSuspended: boolean;

  /** The name of the account on the remote platform */
  platformAccountName?: string;

  constructor(data: Account) {
    this.platformAccountId = data.platformAccountId;
    this.currency = data.currency;
    this.isTradingAllowed = data.isTradingAllowed;
    this.isSuspended = data.isSuspended;
    this.platformAccountName = data.platformAccountName;
  }
}
