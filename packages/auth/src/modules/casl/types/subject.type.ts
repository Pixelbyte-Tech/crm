import { InferSubjects } from '@casl/ability';

import { CompanySetting } from '@crm/types';

import { UserDetailSubject } from '../subjects/user-detail.subject';
import {
  TagSubject,
  UserSubject,
  AlertSubject,
  ServerSubject,
  WalletSubject,
  ChannelSubject,
  CompanySubject,
  LoyaltySubject,
  AuditLogSubject,
  UserNoteSubject,
  WheelSpinSubject,
  UserAvatarSubject,
  BillingInfoSubject,
  IntegrationSubject,
  UserCompanySubject,
  UserSettingSubject,
  OrganisationSubject,
  TradingEventSubject,
  UserDocumentSubject,
  ExchangeRateSubject,
  LoyaltyHistorySubject,
  PlatformClientSubject,
  TradingAccountSubject,
  UserAuthSessionSubject,
  UserNotificationSubject,
  CompanyInvitationSubject,
  TradingAccountTagSubject,
  WalletTransactionSubject,
  PaymentTransactionSubject,
  TradingAccountNoteSubject,
  TradingAccountTypeSubject,
  WalletTransactionHistorySubject,
  TradingAccountTypeLeverageSubject,
} from '../subjects';

export type Subject = InferSubjects<
  | typeof AlertSubject
  | typeof AuditLogSubject
  | typeof BillingInfoSubject
  | typeof ChannelSubject
  | typeof CompanySubject
  | typeof CompanyInvitationSubject
  | typeof CompanySetting
  | typeof ExchangeRateSubject
  | typeof IntegrationSubject
  | typeof LoyaltySubject
  | typeof LoyaltyHistorySubject
  | typeof OrganisationSubject
  | typeof PaymentTransactionSubject
  | typeof PlatformClientSubject
  | typeof ServerSubject
  | typeof TagSubject
  | typeof TradingAccountSubject
  | typeof TradingAccountNoteSubject
  | typeof TradingAccountTagSubject
  | typeof TradingAccountTypeSubject
  | typeof TradingAccountTypeLeverageSubject
  | typeof TradingEventSubject
  | typeof UserSubject
  | typeof UserAuthSessionSubject
  | typeof UserAvatarSubject
  | typeof UserCompanySubject
  | typeof UserDetailSubject
  | typeof UserDocumentSubject
  | typeof UserNoteSubject
  | typeof UserNotificationSubject
  | typeof UserSettingSubject
  | typeof WalletSubject
  | typeof WalletTransactionSubject
  | typeof WalletTransactionHistorySubject
  | typeof WheelSpinSubject
>;
