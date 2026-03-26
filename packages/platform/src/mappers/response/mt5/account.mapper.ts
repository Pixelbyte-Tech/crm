import { Axios } from 'axios';
import { Injectable } from '@nestjs/common';

import { Account } from '../../../models/account';
import { Balance } from '../../../models/balance';
import { AccountResult } from '../../../models/account-result';

import { Mt5User } from '../../../types/mt5/account/user.type';
import { Mt5Account } from '../../../types/mt5/account/account.type';

import { Mt5MapperHelper } from '../../helper/mt5-mapper.helper';
import { UnprocessableResponseException } from '../../../exceptions';

@Injectable()
export class AccountMapper {
  constructor(private readonly helper: Mt5MapperHelper) {}

  async toAccount(axios: Axios, mt5User: Mt5User, platformAccountId: string): Promise<Account> {
    const map = await this.helper.getGroupCurrenciesMap(axios, mt5User.group);
    const currency = map.get(mt5User.group);
    if (!currency) {
      throw new UnprocessableResponseException('group', mt5User.group);
    }

    const rights = mt5User.rights.split(',').map((right) => right.trim());

    return new Account({
      platformAccountId,
      currency,
      isTradingAllowed: !rights.includes('USER_RIGHT_TRADE_DISABLED'),
      isSuspended: !rights.includes('USER_RIGHT_ENABLED'),
    });
  }

  toAccountResult(
    data: Mt5Account,
    password?: string,
    readonlyPassword?: string,
    phonePassword?: string,
  ): AccountResult {
    const login = data.login.toString();

    return new AccountResult({
      platformAccountId: login,
      platformAccountName: undefined,
      platformUserId: undefined,
      masterCredential: password ? { login, password: password } : undefined,
      readonlyCredential: readonlyPassword ? { login, password: readonlyPassword } : undefined,
      phoneCredential: phonePassword ? { login, password: phonePassword } : undefined,
    });
  }

  toBalance(platformAccountId: string, data: Mt5Account): Balance {
    return new Balance({
      platformAccountId,
      balance: data.balance,
      equity: data.equity,
      withdrawable: data.marginFree - data.credit,
      credit: data.credit,
      margin: data.margin,
      freeMargin: data.marginFree,
      netPnl: data.profit,
    });
  }
}
