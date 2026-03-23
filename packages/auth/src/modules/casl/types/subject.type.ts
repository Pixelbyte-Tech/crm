import { InferSubjects } from '@casl/ability';

import {
  TagSubject,
  UserSubject,
  AlertSubject,
  ServerSubject,
  WalletSubject,
  ChannelSubject,
  LoyaltySubject,
  AuditLogSubject,
  UserNoteSubject,
  WheelSpinSubject,
  UserAvatarSubject,
  InvitationSubject,
  UserDetailSubject,
  IntegrationSubject,
  UserSettingSubject,
  TradingEventSubject,
  UserDocumentSubject,
  ExchangeRateSubject,
  GlobalSettingSubject,
  LoyaltyHistorySubject,
  PlatformClientSubject,
  TradingAccountSubject,
  UserAuthSessionSubject,
  UserNotificationSubject,
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
  | typeof ChannelSubject
  | typeof ExchangeRateSubject
  | typeof GlobalSettingSubject
  | typeof InvitationSubject
  | typeof IntegrationSubject
  | typeof LoyaltySubject
  | typeof LoyaltyHistorySubject
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
