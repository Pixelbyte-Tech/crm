export class CommissionGroup {
  /** The ID of the commission group on the trading platform */
  platformGroupId: string;

  /** The name of the commission group */
  name: string;

  /** The currency which the group belongs to */
  currency?: string;

  constructor(data: CommissionGroup) {
    this.platformGroupId = data.platformGroupId;
    this.name = data.name;
    this.currency = data.currency?.toUpperCase();
  }
}
