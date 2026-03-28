import { Injectable } from '@nestjs/common';

import { RiskPlan } from '../../../models';

import { TlSpreadPlan } from '../../../types/tl/plan/spread-plan.type';

@Injectable()
export class RiskPlanMapper {
  /**
   * Converts a risk plan to risk group
   * @param data The raw risk plan from the platform
   */
  toRiskPlan(data: TlSpreadPlan): RiskPlan {
    return new RiskPlan({
      platformPlanId: String(data.id),
      name: data.name,
    });
  }

  /**
   * Converts risk plans to risk groups
   * @param data The raw risk plans from the platform
   */
  toRiskPlans(data: TlSpreadPlan[]): RiskPlan[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data.map((d) => this.toRiskPlan(d));
  }
}
