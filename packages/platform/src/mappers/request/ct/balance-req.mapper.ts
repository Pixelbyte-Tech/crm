import Long from 'long';
import { Injectable } from '@nestjs/common';

import { BalanceOperation } from '../../../models/balance';

import { CtManagerApiService } from '../../../services/ct/manager/ct-manager-api.service';

import { TraderReqMapper } from './trader-req.mapper';
import { InvalidMethodParametersException } from '../../../exceptions';
import {
  ProtoChangeBonusType,
  ProtoChangeBalanceReq,
  ProtoChangeBalanceType,
  ProtoManagerChangeBonusReq,
} from '../../../services/ct/manager/proto/base/ts';

@Injectable()
export class BalanceReqMapper {
  constructor(private readonly traderReqMapper: TraderReqMapper) {}

  async toChangeBalance(
    managerApi: CtManagerApiService,
    operation: BalanceOperation,
    amount: number,
    comment: string,
    platformAccountId: string,
    referenceId?: string,
  ): Promise<ProtoChangeBalanceReq> {
    let type: ProtoChangeBalanceType;
    switch (operation) {
      case BalanceOperation.ADD:
        amount = await this.#toDigits(Math.abs(amount), platformAccountId, managerApi);
        type = ProtoChangeBalanceType.BALANCE_DEPOSIT;
        break;
      case BalanceOperation.SUB:
        amount = await this.#toDigits(Math.abs(amount), platformAccountId, managerApi);
        type = ProtoChangeBalanceType.BALANCE_WITHDRAW;
        break;
      case BalanceOperation.COMMISSION:
        amount = await this.#toDigits(Math.abs(amount), platformAccountId, managerApi);
        type = ProtoChangeBalanceType.BALANCE_WITHDRAW_STRATEGY_COMMISSION_INNER;
        break;
      case BalanceOperation.SWAP:
        type = ProtoChangeBalanceType.BALANCE_WITHDRAW_SWAP;
        amount = await this.#toDigits(Math.abs(amount), platformAccountId, managerApi);
        break;
      case BalanceOperation.ADJUSTMENT:
        type = amount > 0 ? ProtoChangeBalanceType.BALANCE_DEPOSIT : ProtoChangeBalanceType.BALANCE_WITHDRAW;
        comment = `Adjustment: ${comment}`;
        amount = await this.#toDigits(Math.abs(amount), platformAccountId, managerApi);
        break;
      default:
        throw new InvalidMethodParametersException(`Invalid balance operation '${operation}'`);
    }

    return {
      traderId: Long.fromString(platformAccountId),
      amount: Long.fromNumber(amount),
      comment,
      type,
      externalNote: comment,
      ...(referenceId ? { externalId: referenceId } : {}),
      source: 'PixelByte CRM',
    };
  }

  async toChangeBonus(
    managerApi: CtManagerApiService,
    operation: BalanceOperation,
    amount: number,
    comment: string,
    platformAccountId: string,
    referenceId?: string,
  ): Promise<ProtoManagerChangeBonusReq> {
    let type: ProtoChangeBonusType;
    switch (operation) {
      case BalanceOperation.CREDIT:
        type = ProtoChangeBonusType.BONUS_DEPOSIT;
        amount = await this.#toDigits(Math.abs(amount), platformAccountId, managerApi);
        break;
      case BalanceOperation.DEBIT:
        type = ProtoChangeBonusType.BONUS_WITHDRAW;
        amount = -(await this.#toDigits(Math.abs(amount), platformAccountId, managerApi));
        break;
      default:
        throw new InvalidMethodParametersException(`Invalid balance operation '${operation}'`);
    }

    return {
      traderId: Long.fromString(platformAccountId),
      amount: Long.fromNumber(amount),
      comment,
      type,
      externalNote: comment,
      ...(referenceId ? { externalId: referenceId } : {}),
    };
  }

  /**
   * Converts an amount to the correct digits
   * @param amount The amount to convert
   * @param platformAccountId The account id
   * @param managerApi The ManagerAPI service
   */
  async #toDigits(amount: number, platformAccountId: string, managerApi: CtManagerApiService): Promise<number> {
    const trader = await this.traderReqMapper.toProtoTraderById(managerApi, platformAccountId);

    return amount * Math.pow(10, trader.moneyDigits ?? 0);
  }
}
