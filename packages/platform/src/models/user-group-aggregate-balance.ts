export class UserGroupAggregateBalance {
  /** The id of the user group the aggregate data belongs to */
  userGroupId: string;

  /** The total sum of balances belonging to all accounts on this user group */
  balance: number;

  /** The total sum of equity belonging to all accounts on this user group */
  equity: number;

  /** The total sum of credit (bonus money) belonging to all accounts on this user group */
  credit: number;

  /** The total sum of negative balances belonging to all accounts on this user group */
  negativeBalance: number;

  /** The number of accounts within this user group which have a negative balance */
  numNegativeAccounts: number;

  /** The currency of the aggregate */
  currency: string;

  constructor(data: UserGroupAggregateBalance) {
    this.balance = data.balance;
    this.credit = data.credit;
    this.currency = data.currency;
    this.equity = data.equity;
    this.negativeBalance = data.negativeBalance;
    this.numNegativeAccounts = data.numNegativeAccounts;
    this.userGroupId = data.userGroupId;
  }
}
