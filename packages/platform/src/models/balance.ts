export enum BalanceOperation {
  ADD = 'add',
  SUB = 'sub',
  ADJUSTMENT = 'adjustment',
  COMMISSION = 'commission',
  SWAP = 'swap',
  CREDIT = 'credit',
  DEBIT = 'debit',
  BONUS = 'bonus',
}

export class Balance {
  /** The platform account id to which this balance belongs */
  platformAccountId: string;

  /** The available balance amount */
  balance: number;

  /** The available equity amount */
  equity: number;

  /** The available max withdrawable amount */
  withdrawable: number;

  /** The total credit (bonus money) present in the balance */
  credit: number;

  /** The total money borrowed from the broker to purchase all investments */
  margin: number;

  /** The total equity not reserved for margin or open positions, and which is available to be used to open new trades. */
  freeMargin: number;

  /** The net profit or loss on open positions. */
  netPnl?: number;

  constructor(data: Balance) {
    this.platformAccountId = data.platformAccountId;
    this.balance = data.balance;
    this.equity = data.equity;
    this.withdrawable = data.withdrawable;
    this.credit = data.credit;
    this.margin = data.margin;
    this.freeMargin = data.freeMargin;
    this.netPnl = data.netPnl;
  }
}

/**
 * Check if the given object is a Balance
 * @param b The object to check
 */
export function isBalance(b: unknown): b is Balance {
  return (
    undefined !== b &&
    null !== b &&
    'object' === typeof b &&
    ['balance', 'equity', 'withdrawable', 'credit', 'margin', 'freeMargin', 'netPnl'].every((prop) => prop in b)
  );
}
