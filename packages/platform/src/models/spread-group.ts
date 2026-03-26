export class SpreadGroup {
  /** The ID of the spread group on the trading platform */
  platformGroupId: string;

  /** The name of the spread group */
  name: string;

  constructor(data: SpreadGroup) {
    this.platformGroupId = data.platformGroupId;
    this.name = data.name;
  }
}
