import { Injectable } from '@nestjs/common';

import { GroupReqMapper } from './mt5/group-req.mapper';
import { CommandReqMapper } from './mt5/command-req.mapper';
import { BalanceOperationReqMapper } from './mt5/balance-operation-req.mapper';

import { RequestMapper } from './request-mapper.interface';

// Set allowed mappers here
type Mappers = 'BalanceOperationReqMapper' | 'CommandReqMapper' | 'GroupReqMapper';

@Injectable()
export class Mt5RequestMapper implements RequestMapper {
  constructor(
    private readonly balanceOperationMapper: BalanceOperationReqMapper,
    private readonly commandMapper: CommandReqMapper,
    private readonly groupMapper: GroupReqMapper,
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
