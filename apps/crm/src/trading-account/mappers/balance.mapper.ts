import { Injectable } from '@nestjs/common';

import { Balance as PlatformBalance } from '@crm/platform';

import { Balance } from '../domain';

@Injectable()
export class BalanceMapper {
  toBalance(data: PlatformBalance): Balance {
    const model = new Balance();
    model.balance = data.balance;
    model.equity = data.equity;
    model.availableMargin = data.freeMargin;
    model.totalMargin = data.margin;
    model.withdrawable = data.withdrawable;

    return model;
  }
}
