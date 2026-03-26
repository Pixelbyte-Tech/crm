import { Injectable } from '@nestjs/common';

import { BarMapper } from './mt5/bar.mapper';
import { DealMapper } from './mt5/deal.mapper';
import { OrderMapper } from './mt5/order.mapper';
import { SymbolMapper } from './mt5/symbol.mapper';
import { HolidayMapper } from './mt5/holiday.mapper';
import { AccountMapper } from './mt5/account.mapper';
import { JournalMapper } from './mt5/journal.mapper';
import { PositionMapper } from './mt5/position.mapper';
import { UserGroupMapper } from './mt5/user-group.mapper';
import { CommissionGroupMapper } from './mt5/commission-group.mapper';

import { ResponseMapper } from './response-mapper.interface';

// Set allowed mappers here
type Mt5Mappers =
  | 'AccountMapper'
  | 'BarMapper'
  | 'CommissionGroupMapper'
  | 'DealMapper'
  | 'HolidayMapper'
  | 'JournalMapper'
  | 'OrderMapper'
  | 'PositionMapper'
  | 'SymbolMapper'
  | 'UserGroupMapper';

@Injectable()
export class Mt5ResponseMapper implements ResponseMapper {
  constructor(
    private readonly accountMapper: AccountMapper,
    private readonly barMapper: BarMapper,
    private readonly commissionGroup: CommissionGroupMapper,
    private readonly dealMapper: DealMapper,
    private readonly holidayMapper: HolidayMapper,
    private readonly journalMapper: JournalMapper,
    private readonly orderMapper: OrderMapper,
    private readonly positionMapper: PositionMapper,
    private readonly symbolMapper: SymbolMapper,
    private readonly userGroupMapper: UserGroupMapper,
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
  get<T>(name: Mt5Mappers): T {
    return this.#mappers.get(name);
  }
}
