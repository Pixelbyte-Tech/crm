import { Injectable } from '@nestjs/common';

import { Balance } from '../../../models/balance';
import { Account } from '../../../models/account';
import { AccountResult } from '../../../models/account-result';
import { TlAccount } from '../../../types/tl/account/account.type';

@Injectable()
export class AccountMapper {
  toAccount(data: TlAccount): Account {
    return new Account({
      platformAccountId: data.accountId,
      currency: data.currency,
      isTradingAllowed: 'ACTIVE' === data.status,
      isSuspended: 'SUSPENDED' === data.status,
      platformAccountName: data.accountName,
    });
  }

  toAccountResult(
    userId: string,
    accountId: string,
    email: string,
    accountName: string,
    password: string,
  ): AccountResult {
    return {
      platformAccountId: accountId,
      platformAccountName: accountName,
      platformUserId: userId,
      masterCredential: password ? { login: email, password: password } : undefined,
      readonlyCredential: undefined,
      phoneCredential: undefined,
    };
  }

  toBalance(account: TlAccount): Balance {
    return new Balance({
      platformAccountId: account.accountId,
      balance: Number(account.balance) - Number(account.credit),
      equity: Number(account.equity),
      withdrawable: Number(account.balance) - Number(account.blockedBalance),
      credit: Number(account.credit),
      margin: Number(account.marginAvailable) + Number(account.marginUsed),
      freeMargin: Number(account.marginAvailable),
      netPnl: Number(account.pnl),
    });
  }
}
