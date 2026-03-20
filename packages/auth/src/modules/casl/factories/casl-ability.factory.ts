import { Injectable } from '@nestjs/common';
import { PureAbility, AbilityBuilder, ExtractSubjectType } from '@casl/ability';

import { Role } from '@crm/types';

import { Action, Subject, CaslUser } from '../types';
import { UserDetailSubject } from '../subjects/user-detail.subject';
import {
  TagSubject,
  UserSubject,
  AlertSubject,
  WalletSubject,
  ServerSubject,
  LoyaltySubject,
  ChannelSubject,
  AuditLogSubject,
  WheelSpinSubject,
  UserAvatarSubject,
  UserSettingSubject,
  BillingInfoSubject,
  IntegrationSubject,
  UserDocumentSubject,
  TradingEventSubject,
  ExchangeRateSubject,
  LoyaltyHistorySubject,
  TradingAccountSubject,
  CompanySettingSubject,
  PlatformClientSubject,
  UserAuthSessionSubject,
  UserNotificationSubject,
  CompanyInvitationSubject,
  WalletTransactionSubject,
  TradingAccountTagSubject,
  PaymentTransactionSubject,
  TradingAccountNoteSubject,
  TradingAccountTypeSubject,
  WalletTransactionHistorySubject,
  TradingAccountTypeLeverageSubject,
} from '../subjects';

@Injectable()
export class CaslAbilityFactory {
  /**
   * Creates the abilities for a CASL user
   * @param user The user details
   */
  createForUser(user: CaslUser): PureAbility<[Action, Subject]> {
    const { can, build } = new AbilityBuilder(PureAbility<[Action, Subject]>);

    // Iterate over user roles in companies
    for (const [companyId, value] of Object.entries(user.roles)) {
      for (const role of value) {
        switch (role) {
          case Role.ADMIN:
            can(Action.MANAGE, AlertSubject, { companyId });
            can(Action.READ, AuditLogSubject, { companyId });
            can(Action.MANAGE, BillingInfoSubject, { companyId });
            can(Action.MANAGE, ChannelSubject, { companyId });
            can(Action.MANAGE, CompanyInvitationSubject, { companyId });
            can(Action.MANAGE, CompanySettingSubject, { companyId });
            can(Action.READ, ExchangeRateSubject);
            can(Action.MANAGE, IntegrationSubject, { companyId });
            can(Action.MANAGE, LoyaltySubject, { companyId });
            can(Action.READ, LoyaltyHistorySubject, { companyId });
            can(Action.READ, PaymentTransactionSubject, { companyId });
            can(Action.MANAGE, PlatformClientSubject, { companyId });
            can(Action.MANAGE, ServerSubject, { companyId });
            can(Action.MANAGE, TagSubject, { companyId });
            can(Action.MANAGE, TradingAccountSubject, { companyId });
            can(Action.MANAGE, TradingAccountNoteSubject, { companyId });
            can(Action.MANAGE, TradingAccountTagSubject, { companyId });
            can(Action.MANAGE, TradingAccountTypeSubject, { companyId });
            can(Action.MANAGE, TradingAccountTypeLeverageSubject, { companyId });
            can(Action.READ, TradingEventSubject);
            can(Action.MANAGE, UserSubject, { companyId });
            can(Action.READ, UserAuthSessionSubject, { companyId });
            can(Action.MANAGE, UserAvatarSubject, { companyId });
            can(Action.MANAGE, UserDetailSubject, { companyId });
            can(Action.MANAGE, UserDocumentSubject, { companyId });
            can(Action.MANAGE, UserNotificationSubject, { companyId });
            can(Action.MANAGE, UserSettingSubject, { companyId });
            can(Action.READ, WalletSubject, { companyId });
            can(Action.READ, WalletTransactionSubject, { companyId });
            can(Action.CREATE, WalletTransactionSubject, { companyId });
            can(Action.UPDATE, WalletTransactionSubject, { companyId });
            can(Action.READ, WalletTransactionHistorySubject, { companyId });
            can(Action.READ, WheelSpinSubject, { companyId });
            break;
          case Role.TRADE_SUPPORT:
            can(Action.READ, AlertSubject, { companyId });
            can(Action.READ, AuditLogSubject, { companyId, userId: user.userId });
            can(Action.READ, ExchangeRateSubject);
            can(Action.READ, LoyaltySubject, { companyId });
            can(Action.READ, LoyaltyHistorySubject, { companyId });
            can(Action.READ, PaymentTransactionSubject, { companyId });
            can(Action.READ, PlatformClientSubject, { companyId });

            can(Action.MANAGE, TagSubject, { companyId });

            can(Action.READ, TradingAccountSubject, { companyId });
            can(Action.CREATE, TradingAccountSubject, { companyId });
            can(Action.UPDATE, TradingAccountSubject, { companyId });

            can(Action.READ, TradingAccountNoteSubject, { companyId });
            can(Action.CREATE, TradingAccountNoteSubject, { companyId });
            can(Action.UPDATE, TradingAccountNoteSubject, { companyId, authorUserId: user.userId });
            can(Action.DELETE, TradingAccountNoteSubject, { companyId, authorUserId: user.userId });

            can(Action.MANAGE, TradingAccountTagSubject, { companyId });

            can(Action.READ, TradingAccountTypeSubject, { companyId });
            can(Action.READ, TradingAccountTypeLeverageSubject, { companyId });

            can(Action.READ, TradingEventSubject);

            can(Action.READ, UserSubject, { companyId });
            can(Action.CREATE, UserSubject, { companyId });
            can(Action.UPDATE, UserSubject, { companyId });

            can(Action.READ, UserAuthSessionSubject, { companyId });
            can(Action.READ, UserAvatarSubject, { companyId });
            can(Action.READ, UserDetailSubject, { companyId });
            can(Action.READ, UserNotificationSubject, { companyId, userId: user.userId });
            can(Action.READ, UserSettingSubject, { companyId });
            can(Action.READ, WalletSubject, { companyId });
            can(Action.READ, WalletTransactionSubject, { companyId });
            can(Action.READ, WalletTransactionHistorySubject, { companyId });
            can(Action.READ, WheelSpinSubject, { companyId });
            break;
          case Role.CS_AGENT:
            can(Action.READ, UserSubject, { companyId });
            can(Action.READ, UserAuthSessionSubject, { companyId });
            break;
          case Role.COMPLIANCE:
            can(Action.READ, UserSubject, { companyId });
            can(Action.READ, UserAuthSessionSubject, { companyId });
            break;
        }
      }
    }

    // Standard Users
    can(Action.READ, ExchangeRateSubject);
    can(Action.READ, LoyaltySubject, { userId: user.userId });
    can(Action.READ, LoyaltyHistorySubject, { userId: user.userId });
    can(Action.READ, PaymentTransactionSubject, { userId: user.userId });
    can(Action.MANAGE, TradingAccountSubject, { userId: user.userId });
    can(Action.READ, TradingEventSubject);
    can(Action.MANAGE, UserSubject, { id: user.userId });
    can(Action.READ, UserAuthSessionSubject, { userId: user.userId });
    can(Action.MANAGE, UserAvatarSubject, { userId: user.userId });
    can(Action.MANAGE, UserDetailSubject, { userId: user.userId });
    can(Action.MANAGE, UserDocumentSubject, { userId: user.userId });
    can(Action.READ, UserNotificationSubject, { userId: user.userId });
    can(Action.READ, UserSettingSubject, { userId: user.userId });
    can(Action.READ, WalletSubject, { userId: user.userId });
    can(Action.READ, WalletTransactionSubject, { userId: user.userId });
    can(Action.READ, WalletTransactionHistorySubject, { userId: user.userId });
    can(Action.READ, WheelSpinSubject, { userId: user.userId });

    // Read https://casl.js.org/v6/en/guide/subject-type-detection#use-classes-as-subject-types for details
    return build({
      detectSubjectType: (item) => item.constructor as ExtractSubjectType<Subject>,
    });
  }
}
