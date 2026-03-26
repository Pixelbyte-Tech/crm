import { Injectable } from '@nestjs/common';

import { AccountReqMapper } from './tl/account-req.mapper';

import { RequestMapper } from './request-mapper.interface';

// Set allowed mappers here
type TlMappers = 'AccountReqMapper';

@Injectable()
export class TlRequestMapper implements RequestMapper {
  constructor(private readonly accountReqMapper: AccountReqMapper) {
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
  get<T>(name: TlMappers): T {
    return this.#mappers.get(name);
  }
}
