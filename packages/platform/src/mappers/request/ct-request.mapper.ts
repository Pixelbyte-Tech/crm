import { Injectable } from '@nestjs/common';

import { OrderReqMapper } from './ct/order-req.mapper';
import { TraderReqMapper } from './ct/trader-req.mapper';
import { BalanceReqMapper } from './ct/balance-req.mapper';
import { CountryReqMapper } from './ct/country-req.mapper';
import { PositionReqMapper } from './ct/position-req.mapper';
import { TrendbarReqMapper } from './ct/trendbar-req.mapper';

import { RequestMapper } from './request-mapper.interface';

// Set allowed mappers here
type Mappers =
  | 'BalanceReqMapper'
  | 'CountryReqMapper'
  | 'OrderReqMapper'
  | 'PositionReqMapper'
  | 'TraderReqMapper'
  | 'TrendbarReqMapper';

@Injectable()
export class CtRequestMapper implements RequestMapper {
  constructor(
    private readonly balanceMapper: BalanceReqMapper,
    private readonly countryMapper: CountryReqMapper,
    private readonly orderMapper: OrderReqMapper,
    private readonly positionMapper: PositionReqMapper,
    private readonly tradeMapper: TraderReqMapper,
    private readonly trendbarMapper: TrendbarReqMapper,
  ) {
    this.#mappers = new Map();
    for (let arg = 0; arg < arguments.length; ++arg) {
      // eslint-disable-next-line prefer-rest-params
      this.#mappers.set(arguments[arg].constructor.name, arguments[arg]);
    }
  }

  /** Holds a map of all initialised mappers */
  readonly #mappers: Map<string, any>;

  /**
   * Returns the mapper appropriate mapper
   * @param name The name of the mapper to return
   */
  get<T>(name: Mappers): T {
    return this.#mappers.get(name);
  }
}
