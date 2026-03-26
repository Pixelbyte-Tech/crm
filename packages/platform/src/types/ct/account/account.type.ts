import {
  ProtoAccountType,
  ProtoAccessRights,
  ProtoTotalMarginCalculationType,
  ProtoLimitedRiskMarginCalculationStrategy,
} from '../../../services/ct/manager/proto/base/ts';

export interface CtTrader {
  accessRights: ProtoAccessRights;
  accountType: ProtoAccountType;
  balance: number;
  bonus: number;
  cashEquity: number;
  brokerName: string;
  contactDetails: {
    address: string;
    city: string;
    countryId: number;
    documentId: string;
    email: string;
    phone: string;
    state: string;
    zipCode: string;
    introducingBroker1: string;
    introducingBroker2: string;
  };
  depositCurrency: string;
  description: string;
  equity: number;
  freeMargin: number;
  groupName: string;
  isLimitedRisk: false;
  lastConnectionTimestamp: number;
  lastName: string;
  lastUpdateTimestamp: number;
  leverageInCents: number;
  limitedRiskMarginCalculationStrategy: ProtoLimitedRiskMarginCalculationStrategy;
  login: number;
  maxLeverage: number;
  moneyDigits: number;
  name: string;
  nonWithdrawableBonus: number;
  registrationTimestamp: number;
  sendOwnStatement: true;
  sendStatementToBroker: true;
  swapFree: true;
  totalMarginCalculationType: ProtoTotalMarginCalculationType;
  usedMargin: number;
}
