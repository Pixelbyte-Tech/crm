import { Injectable } from '@nestjs/common';

import { ClosePositionResult } from '../../../models/close-position-result';
import { UserGroupAggregateBalance } from '../../../models/user-group-aggregate-balance';

import { TlAccountStatementReport } from '../../../types/tl/report/account-statement-report.type';
import { TlClosedPositionsHistoryReport } from '../../../types/tl/report/closed-positions-history-report.type';

@Injectable()
export class ReportMapper {
  /**
   * Maps a closed positions history report to a ClosePositionResult.
   * @param data The closed positions history report data to map.
   * @param platformPositionId The platform position ID associated with the closed position.
   */
  toClosePositionResult(data: TlClosedPositionsHistoryReport, platformPositionId: string): ClosePositionResult {
    return new ClosePositionResult({
      platformPositionId: platformPositionId,
      platformTradeId: data.closeTradeId,
      closedAt: new Date(data.closeDateTime),
      closePrice: Number(data.closePrice),
      lotsRemaining: Number(data.amount),
      profit: Number(data.profit),
      opened: undefined,
    });
  }

  /**
   * Maps a list of account statement records to a list of user group aggregate balances.
   * @param records The list of account statement records to map.
   * @param userGroupId The user group ID to filter the records by.
   */
  toUserGroupAggregateBalances(records: TlAccountStatementReport[], userGroupId: string): UserGroupAggregateBalance[] {
    // Store a map of user group balances
    const userGroupBalances: Map<string, UserGroupAggregateBalance> = new Map();

    for (const record of records) {
      // Skip items that do not belong to the requested user group
      if (!record.userGroupId || record.userGroupId !== userGroupId) {
        continue;
      }

      // Fetch the entry for this user group id and currency
      const bal = userGroupBalances.get(record.currency);

      // If no entry exists, create a new one
      if (!bal) {
        userGroupBalances.set(
          record.currency,
          new UserGroupAggregateBalance({
            userGroupId: record.userGroupId,
            balance: Number(record.balance),
            equity: Number(record.equity),
            credit: Number(record.credit),
            negativeBalance: Number(record.balance) > 0 ? 0 : Number(record.balance),
            numNegativeAccounts: Number(record.balance) > 0 ? 0 : 1,
            currency: record.currency,
          }),
        );

        continue;
      }

      // Update the existing entry
      bal.balance += Number(record.balance);
      bal.equity += Number(record.equity);
      bal.credit += Number(record.credit);
      bal.negativeBalance -= Number(record.balance) > 0 ? 0 : Number(record.balance);
      bal.numNegativeAccounts += Number(record.balance) > 0 ? 0 : 1;
    }

    return Array.from(userGroupBalances.values());
  }
}
