import { Injectable } from '@nestjs/common';

import { SymbolMapper } from './tl/symbol.mapper';
import { ReportMapper } from './tl/report.mapper';
import { AccountMapper } from './tl/account.mapper';
import { PositionMapper } from './tl/position.mapper';
import { RiskPlanMapper } from './tl/risk-plan.mapper';
import { UserGroupMapper } from './tl/user-group.mapper';
import { SpreadPlanMapper } from './tl/spread-plan.mapper';
import { CommissionPlanMapper } from './tl/commission-plan.mapper';

import { ResponseMapper } from './response-mapper.interface';

// Set allowed mappers here
type TlMappers =
  | 'AccountMapper'
  | 'CommissionPlanMapper'
  | 'ReportMapper'
  | 'PositionMapper'
  | 'RiskPlanMapper'
  | 'SpreadPlanMapper'
  | 'SymbolMapper'
  | 'UserGroupMapper';

@Injectable()
export class TlResponseMapper implements ResponseMapper {
  constructor(
    private readonly accountMapper: AccountMapper,
    private readonly commissionPlanMapper: CommissionPlanMapper,
    private readonly positionMapper: PositionMapper,
    private readonly reportMapper: ReportMapper,
    private readonly riskPlanMapper: RiskPlanMapper,
    private readonly spreadPlanMapper: SpreadPlanMapper,
    private readonly symbolMapper: SymbolMapper,
    private readonly userGroupMapper: UserGroupMapper,
  ) {
    this.#mappers = new Map();
    for (let arg = 0; arg < arguments.length; ++arg) {
      // eslint-disable-next-line prefer-rest-params
      this.#mappers.set(arguments[arg].constructor.name, arguments[arg]);
    }
  }

  /** Holds a map of all initialized mappers */
  readonly #mappers: Map<string, any>;

  /**
   * Returns the mapper appropriate mapper
   * @param name The name of the mapper to return
   */
  get<T>(name: TlMappers): T {
    return this.#mappers.get(name);
  }
}
