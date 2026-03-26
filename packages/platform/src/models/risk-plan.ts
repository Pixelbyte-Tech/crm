export class RiskPlan {
  /** The id of the risk plan on the relevant platform */
  platformPlanId: string;

  /** The name of the risk plan on the relevant platform */
  name: string;

  constructor(data: RiskPlan) {
    this.platformPlanId = data.platformPlanId;
    this.name = data.name;
  }
}
