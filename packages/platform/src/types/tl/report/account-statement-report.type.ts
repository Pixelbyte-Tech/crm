export interface TlAccountStatementReport {
  accountId: string;
  userId: string;
  balance: string;
  credit: string;
  equity: string;
  pnl: string;
  marginUsed: string;
  marginAvailable: string;
  userGroupId: string;
  status: 'ACTIVE' | 'RESTRICTED' | 'SUSPENDED';
  currency: string;
}
