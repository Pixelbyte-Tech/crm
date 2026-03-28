import { codes } from 'currency-codes';
import { Injectable } from '@nestjs/common';

import { CommissionGroup } from '../../../models';

import { TlCommissionPlan } from '../../../types/tl/plan/commission-plan.type';

@Injectable()
export class CommissionPlanMapper {
  /** ISO 4217 currency codes */
  readonly #iso4217Codes = [...new Set(codes().concat(['BTC', 'BIT']))];

  /**
   * Converts a commission plan to commission group
   * @param data The raw commission plan from the platform
   */
  toCommissionGroup(data: TlCommissionPlan): CommissionGroup {
    let currency = data.name?.split('-').pop()?.toUpperCase();
    currency = currency && this.#iso4217Codes.includes(currency) ? currency : undefined;

    return new CommissionGroup({
      platformGroupId: String(data.id),
      name: data.name,
      currency,
    });
  }

  /**
   * Converts commission plans to commission groups
   * @param data The raw commission plans from the platform
   */
  toCommissionGroups(data: TlCommissionPlan[]): CommissionGroup[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data.map((d) => this.toCommissionGroup(d));
  }
}
