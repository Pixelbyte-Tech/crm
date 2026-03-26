import { Injectable } from '@nestjs/common';

import { OrderMapper } from './ct/order.mapper';
import { TraderMapper } from './ct/trader.mapper';
import { SymbolMapper } from './ct/symbol.mapper';
import { HolidayMapper } from './ct/holiday.mapper';
import { TrendbarMapper } from './ct/trendbar.mapper';
import { PositionMapper } from './ct/position.mapper';
import { TraderGroupMapper } from './ct/trader-group.mapper';
import { ScheduleProfileMapper } from './ct/schedule-profile.mapper';

import { ResponseMapper } from './response-mapper.interface';

// Set allowed mappers here
type CtMappers =
  | 'HolidayMapper'
  | 'OrderMapper'
  | 'PositionMapper'
  | 'ScheduleProfileMapper'
  | 'SymbolMapper'
  | 'TraderMapper'
  | 'TraderGroupMapper'
  | 'TrendbarMapper';

@Injectable()
export class CtResponseMapper implements ResponseMapper {
  constructor(
    private readonly holidayMapper: HolidayMapper,
    private readonly orderMapper: OrderMapper,
    private readonly positionMapper: PositionMapper,
    private readonly scheduleProfileMapper: ScheduleProfileMapper,
    private readonly symbolMapper: SymbolMapper,
    private readonly traderMapper: TraderMapper,
    private readonly traderGroupMapper: TraderGroupMapper,
    private readonly trendbarMapper: TrendbarMapper,
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
  get<T>(name: CtMappers): T {
    return this.#mappers.get(name);
  }
}
