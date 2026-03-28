import { Injectable } from '@nestjs/common';

import { SpreadGroup } from '../../../models';

import { TlSpreadPlan } from '../../../types/tl/plan/spread-plan.type';

@Injectable()
export class SpreadPlanMapper {
  /**
   * Converts a spread plan to spread group
   * @param data The raw spread plan from the platform
   */
  toSpreadGroup(data: TlSpreadPlan): SpreadGroup {
    return new SpreadGroup({
      platformGroupId: String(data.id),
      name: data.name,
    });
  }

  /**
   * Converts spread plans to spread groups
   * @param data The raw spread plans from the platform
   */
  toSpreadGroups(data: TlSpreadPlan[]): SpreadGroup[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data.map((d) => this.toSpreadGroup(d));
  }
}
