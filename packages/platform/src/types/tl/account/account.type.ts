export interface TlAccount {
  accountName: string;
  accountId: string;
  userId: string;
  userGroupId: string;
  type: 'LIVE' | 'DEMO';
  status: 'ACTIVE' | 'RESTRICTED' | 'SUSPENDED';
  tradingDisabledReason: { type: 'RISK_RULE' };
  currency: string;
  balance: string;
  blockedBalance: string;
  credit: string;
  equity: string;
  pnl: string;
  marginAvailable: string;
  marginUsed: string;
  createdDateTime: string; // format '2020-01-01T00:00:00.000Z';
  externalId: string;
  riskPlanId: string;
  externalTradingProperties: [{ brokerName: string; extName: string }];
}
