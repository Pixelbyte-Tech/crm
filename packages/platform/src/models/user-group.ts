export class UserGroup {
  /** The id of the group on the trading platform */
  platformGroupId: string;

  /** The name of the group */
  name: string;

  /** The currency which the group belongs to */
  currency?: string;

  constructor(data: UserGroup) {
    this.platformGroupId = data.platformGroupId;
    this.name = data.name;
    this.currency = data.currency;
  }
}
