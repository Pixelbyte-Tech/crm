import { Injectable } from '@nestjs/common';
import { MongoAbility, AbilityBuilder, ExtractSubjectType, createMongoAbility } from '@casl/ability';

import { Role } from '@crm/types';

import { Action, Subject, CaslUser } from '../types';
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
  UserDetailSubject,
  UserAvatarSubject,
  InvitationSubject,
  UserSettingSubject,
  IntegrationSubject,
  UserDocumentSubject,
  TradingEventSubject,
  ExchangeRateSubject,
  GlobalSettingSubject,
  LoyaltyHistorySubject,
  TradingAccountSubject,
  PlatformClientSubject,
  UserAuthSessionSubject,
  UserNotificationSubject,
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
  createForUser(user: CaslUser): MongoAbility {
    const { can, build } = new AbilityBuilder(createMongoAbility);

    // Iterate over user roles
    for (const role of Object.values(user.roles)) {
      switch (role) {
        case Role.ADMIN:
          can(Action.MANAGE, AlertSubject);
          can(Action.READ, AuditLogSubject);
          can(Action.MANAGE, ChannelSubject);
          can(Action.MANAGE, InvitationSubject);
          can(Action.MANAGE, GlobalSettingSubject);
          can(Action.READ, ExchangeRateSubject);
          can(Action.MANAGE, IntegrationSubject);
          can(Action.MANAGE, LoyaltySubject);
          can(Action.READ, LoyaltyHistorySubject);
          can(Action.READ, PaymentTransactionSubject);
          can(Action.MANAGE, PlatformClientSubject);
          can(Action.MANAGE, ServerSubject);
          can(Action.MANAGE, TagSubject);
          can(Action.MANAGE, TradingAccountSubject);
          can(Action.MANAGE, TradingAccountNoteSubject);
          can(Action.MANAGE, TradingAccountTagSubject);
          can(Action.MANAGE, TradingAccountTypeSubject);
          can(Action.MANAGE, TradingAccountTypeLeverageSubject);
          can(Action.READ, TradingEventSubject);
          can(Action.MANAGE, UserSubject);
          can(Action.READ, UserAuthSessionSubject);
          can(Action.MANAGE, UserAvatarSubject);
          can(Action.MANAGE, UserDetailSubject);
          can(Action.MANAGE, UserDocumentSubject);
          can(Action.MANAGE, UserNotificationSubject);
          can(Action.MANAGE, UserSettingSubject);
          can(Action.READ, WalletSubject);
          can(Action.READ, WalletTransactionSubject);
          can(Action.CREATE, WalletTransactionSubject);
          can(Action.UPDATE, WalletTransactionSubject);
          can(Action.READ, WalletTransactionHistorySubject);
          can(Action.READ, WheelSpinSubject);
          break;
        case Role.TRADE_SUPPORT:
          can(Action.READ, AlertSubject);
          can(Action.READ, AuditLogSubject, { userId: user.userId });
          can(Action.READ, ExchangeRateSubject);
          can(Action.READ, LoyaltySubject);
          can(Action.READ, LoyaltyHistorySubject);
          can(Action.READ, PaymentTransactionSubject);
          can(Action.READ, PlatformClientSubject);

          can(Action.MANAGE, TagSubject);

          can(Action.READ, TradingAccountSubject);
          can(Action.CREATE, TradingAccountSubject);
          can(Action.UPDATE, TradingAccountSubject);

          can(Action.READ, TradingAccountNoteSubject);
          can(Action.CREATE, TradingAccountNoteSubject);
          can(Action.UPDATE, TradingAccountNoteSubject, { authorId: user.userId });
          can(Action.DELETE, TradingAccountNoteSubject, { authorId: user.userId });

          can(Action.MANAGE, TradingAccountTagSubject);

          can(Action.READ, TradingAccountTypeSubject);
          can(Action.READ, TradingAccountTypeLeverageSubject);

          can(Action.READ, TradingEventSubject);

          can(Action.READ, UserSubject);
          can(Action.CREATE, UserSubject);
          can(Action.UPDATE, UserSubject);

          can(Action.READ, UserAuthSessionSubject);
          can(Action.READ, UserAvatarSubject);
          can(Action.READ, UserDetailSubject);
          can(Action.READ, UserNotificationSubject, { userId: user.userId });
          can(Action.READ, UserSettingSubject);
          can(Action.READ, WalletSubject);
          can(Action.READ, WalletTransactionSubject);
          can(Action.READ, WalletTransactionHistorySubject);
          can(Action.READ, WheelSpinSubject);
          break;
        case Role.CS_AGENT:
          can(Action.READ, UserSubject);
          can(Action.READ, UserAuthSessionSubject);
          break;
        case Role.COMPLIANCE:
          can(Action.READ, UserSubject);
          can(Action.READ, UserAuthSessionSubject);
          break;
      }
    }

    // Standard Users
    can(Action.READ, ExchangeRateSubject);
    can(Action.READ, TradingEventSubject);

    can(Action.READ, LoyaltySubject, { userId: user.userId });
    can(Action.READ, LoyaltyHistorySubject, { userId: user.userId });
    can(Action.READ, PaymentTransactionSubject, { userId: user.userId });
    can(Action.MANAGE, TradingAccountSubject, { userId: user.userId });
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
