import { Injectable } from '@nestjs/common';

import { Balance } from '../../../models/balance';
import { Account } from '../../../models/account';
import { AccountResult } from '../../../models/account-result';

import { CtCtid } from '../../../types/ct/user/ctid.type';
import { CtTrader } from '../../../types/ct/account/account.type';

import { CtManagerApiService } from '../../../services/ct/manager/ct-manager-api.service';

import { CtMapperHelper } from '../../helper/ct-mapper.helper';
import { UnprocessableResponseException } from '../../../exceptions';
import { ProtoTrader, ProtoAccessRights, ProtoManagerLightTrader } from '../../../services/ct/manager/proto/base/ts';

@Injectable()
export class TraderMapper {
  constructor(private readonly helper: CtMapperHelper) {}

  async toAccount(managerApi: CtManagerApiService, trader: ProtoTrader): Promise<Account> {
    const depositAssetId = trader.depositAssetId?.toString();
    if (!depositAssetId) {
      throw new UnprocessableResponseException('depositAssetId', trader.depositAssetId);
    }

    const map = await this.helper.getAssetMap(managerApi, depositAssetId);
    const currency = map.get(depositAssetId);
    if (!currency) {
      throw new UnprocessableResponseException('depositAssetId', trader.depositAssetId);
    }

    return {
      platformAccountId: trader.traderId.toString(),
      platformAccountName: trader.login.toString(),
      currency: currency.name,
      isTradingAllowed: trader.accessRights !== ProtoAccessRights.NO_TRADING,
      isSuspended: trader.accessRights === ProtoAccessRights.NO_LOGIN,
    };
  }

  toAccountResult(trader: ProtoManagerLightTrader, ctid: CtCtid, password: string): AccountResult {
    return {
      platformAccountId: trader.traderId.toString(),
      platformAccountName: trader.login.toString(),
      platformUserId: ctid.userId.toString(),
      masterCredential: { login: trader.traderId.toString(), password },
    };
  }

  /**
   * Converts a trader to a balance
   * @param platformAccountId the account id
   * @param data the trader data
   */
  toBalance(platformAccountId: string, data: CtTrader): Balance {
    return {
      platformAccountId,
      balance: this.#setDecimal(data.balance, data.moneyDigits),
      equity: this.#setDecimal(data.equity, data.moneyDigits),
      credit: this.#setDecimal(data.nonWithdrawableBonus, data.moneyDigits),
      withdrawable: this.#setDecimal(data.balance - data.nonWithdrawableBonus, data.moneyDigits),
      netPnl: this.#setDecimal(data.equity - data.balance, data.moneyDigits),
      margin: this.#setDecimal(data.usedMargin, data.moneyDigits),
      freeMargin: this.#setDecimal(data.freeMargin, data.moneyDigits),
    };
  }

  /**
   * Sets the correct decimal place in the number
   * @param num the number to insert the decimal place
   * @param digits the number of digits to insert
   */
  #setDecimal(num: number, digits: number): number {
    if (digits === 0) {
      return num;
    }

    return Number((num / Math.pow(10, digits)).toFixed(digits));
  }
}
