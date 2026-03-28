import { Injectable } from '@nestjs/common';

import { BalanceOperation } from '../../../models';

import { UnprocessableResponseException } from '../../../exceptions';

enum Mt5BalanceOperations {
  DEAL_BUY = 'DEAL_BUY',
  DEAL_BALANCE = 'DEAL_BALANCE',
  DEAL_CORRECTION = 'DEAL_CORRECTION',
  DEAL_COMMISSION = 'DEAL_COMMISSION',
  DEAL_CHARGE = 'DEAL_CHARGE',
  DEAL_CREDIT = 'DEAL_CREDIT',
}

interface Mt5BalanceOperation {
  login: number;
  type: Mt5BalanceOperations;
  value: number;
  comment?: string;
}

@Injectable()
export class BalanceOperationReqMapper {
  toBalanceOperation(
    platformAccountId: string,
    amount: number,
    operation: BalanceOperation,
    comment?: string,
  ): Mt5BalanceOperation {
    // Define where we must flip the sign of the amount
    switch (operation) {
      case BalanceOperation.SUB:
      case BalanceOperation.COMMISSION:
      case BalanceOperation.SWAP:
        amount = -Math.abs(amount);
        break;
      case BalanceOperation.ADD:
      case BalanceOperation.CREDIT:
        amount = Math.abs(amount);
        break;
      case BalanceOperation.DEBIT:
        amount = -Math.abs(amount);
        break;
    }

    // Define the operation type
    let type: Mt5BalanceOperations;
    switch (operation) {
      case BalanceOperation.ADD:
        type = Mt5BalanceOperations.DEAL_BALANCE;
        break;
      case BalanceOperation.SUB:
        type = Mt5BalanceOperations.DEAL_BALANCE;
        break;
      case BalanceOperation.ADJUSTMENT:
        type = Mt5BalanceOperations.DEAL_CORRECTION;
        break;
      case BalanceOperation.COMMISSION:
        type = Mt5BalanceOperations.DEAL_COMMISSION;
        break;
      case BalanceOperation.SWAP:
        type = Mt5BalanceOperations.DEAL_CHARGE;
        break;
      case BalanceOperation.CREDIT:
      case BalanceOperation.DEBIT:
        type = Mt5BalanceOperations.DEAL_CREDIT;
        break;
      default:
        throw new UnprocessableResponseException('BalanceOperation', operation);
    }

    return {
      login: Number(platformAccountId),
      type,
      value: amount,
      comment: comment ?? '', // mt5 requires that a comment is present inside the request even empty one.
    };
  }
}
