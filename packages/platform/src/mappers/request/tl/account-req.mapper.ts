import { Axios } from 'axios';
import { Injectable } from '@nestjs/common';

import { TlMapperHelper } from '../../helper/tl-mapper.helper';
import { UnknownLeverageException, UnknownRiskPlanException } from '../../../exceptions';

@Injectable()
export class AccountReqMapper {
  constructor(private readonly helper: TlMapperHelper) {}

  /** The base suffix for risk plans */
  readonly #baseRiskPlanSuffix = 'margin plan - ';

  /** The name of the zero risk plan */
  readonly #zeroRiskPlan = 'zero risk';

  /**
   * Updates a set of risk plans based on the given risk plan id or leverage.
   * If a risk plan id is given, it will be used, otherwise the leverage will be
   * used to find the risk plan id.
   * @param axios The axios client linked to the platform
   * @param environment The environment the server is operating in, either 'live' or 'demo'
   * @param riskPlanId  The risk plan id. Takes precedence over leverage
   * @param leverage The leverage. Only used if riskPlanId is not given
   * @throws UnknownRiskPlanException if the given risk plan id is not found
   * @throws UnknownLeverageException if the given leverage is not found
   */
  async toRiskPlan(
    axios: Axios,
    environment: 'live' | 'demo',
    riskPlanId?: string,
    leverage?: number,
  ): Promise<string> {
    // Prefer the given risk plan id over the leverage
    let ruleValue = riskPlanId;

    // Otherwise, find the risk plan id based on the leverage
    if (!ruleValue && leverage) {
      // First check the cached data
      ruleValue = this.#findBaseRiskPlanId(leverage, await this.helper.getRiskPlanMap(axios, environment));

      // Otherwise, request a fresh copy
      if (!ruleValue) {
        const map = await this.helper.getRiskPlanMap(axios, environment, true);
        ruleValue = this.#findBaseRiskPlanId(leverage, map);
      }

      if (!ruleValue) {
        throw new UnknownLeverageException(leverage);
      }
    }

    // If we still don't have a risk plan id, throw an exception
    if (!ruleValue) {
      throw new UnknownRiskPlanException(riskPlanId);
    }

    // Return the risk plan id
    return ruleValue;
  }

  /**
   * Returns the base risk plan id for the given leverage
   * @param leverage the wanted leverage
   * @param riskPlanMap the full map of risk plans
   * @throws UnknownLeverageException if the leverage is not found
   */
  #findBaseRiskPlanId(leverage: number, riskPlanMap: Map<string, string>): string | undefined {
    for (const [riskPlanId, name] of riskPlanMap.entries()) {
      const n = name.toLowerCase();
      if (Number(n.replace(this.#baseRiskPlanSuffix, '')) === leverage) {
        return riskPlanId;
      }
      if (1 === leverage && n === this.#zeroRiskPlan) {
        return riskPlanId;
      }
    }

    return undefined;
  }
}
