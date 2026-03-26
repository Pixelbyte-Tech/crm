export interface TlAccountOperationsHistoryReport {
  id: string;
  dateTime: string;
  operationType:
    | 'TRADING'
    | 'DEPOSIT'
    | 'WITHDRAW'
    | 'COMMISSION'
    | 'SWAP'
    | 'BLOCKING'
    | 'UNBLOCKING'
    | 'ADJUSTMENT'
    | 'DIVIDEND'
    | 'TRANSFER'
    | 'SPREAD'
    | 'CREDIT'
    | 'BALANCE_CREDIT';
  balanceChange: string;
  amount: string;
  accountId: string;
  note: string;
  externalId?: string;
}
