import { Type, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, ObjectLiteral } from 'typeorm';
import { EntityTarget } from 'typeorm/common/EntityTarget';

import {
  TagEntity,
  UserEntity,
  AlertEntity,
  ServerEntity,
  WalletEntity,
  ChannelEntity,
  CompanyEntity,
  LoyaltyEntity,
  AuditLogEntity,
  UserNoteEntity,
  WheelSpinEntity,
  UserDetailEntity,
  UserAvatarEntity,
  BillingInfoEntity,
  IntegrationEntity,
  UserCompanyEntity,
  UserSettingEntity,
  OrganisationEntity,
  TradingEventEntity,
  UserDocumentEntity,
  CompanySettingEntity,
  LoyaltyHistoryEntity,
  PlatformClientEntity,
  TradingAccountEntity,
  UserAuthSessionEntity,
  UserNotificationEntity,
  CompanyInvitationEntity,
  TradingAccountTagEntity,
  WalletTransactionEntity,
  PaymentTransactionEntity,
  TradingAccountNoteEntity,
  TradingAccountTypeEntity,
  WalletTransactionHistoryEntity,
  TradingAccountTypeLeverageEntity,
} from '@crm/database';

import { Option, Subject } from '../types';
import { AuthenticatedReq } from '../../../types';
import { InvalidSubjectException } from '../exceptions';
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
  ExchangeRateSubject,
  OrganisationSubject,
  TradingEventSubject,
  UserDocumentSubject,
  CompanySettingSubject,
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

@Injectable()
export class SubjectFactory {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Creates the subject object for the provided subject id
   * @param subject The type of subject to create
   * @param option The options on how to find the subject from the request context
   * @param req The request context to find the subject from
   */
  async create(subject: Type<Subject>, option: Option<typeof subject>, req: AuthenticatedReq): Promise<Subject> {
    // Extract the value to search by
    const value = req[option.in][option.use];

    let params: string[] = [];
    switch (subject.name) {
      case AlertSubject.name:
        params = ['id', 'companyId'];
        return new AlertSubject(await this.#find(AlertEntity, params, option.findBy, value));

      case AuditLogSubject.name:
        params = ['id', 'userId', 'companyId'];
        return new AuditLogSubject(await this.#find(AuditLogEntity, params, option.findBy, value));

      case BillingInfoSubject.name:
        params = ['id', 'companyId'];
        return new BillingInfoSubject(await this.#find(BillingInfoEntity, params, option.findBy, value));

      case ChannelSubject.name:
        params = ['id', 'companyId'];
        return new ChannelSubject(await this.#find(ChannelEntity, params, option.findBy, value));

      case CompanySubject.name:
        params = ['id', 'organisationId'];
        return new CompanySubject(await this.#find(CompanyEntity, params, option.findBy, value));

      case CompanyInvitationSubject.name:
        params = ['id', 'sentByUserId', 'companyId'];
        return new CompanyInvitationSubject(await this.#find(CompanyInvitationEntity, params, option.findBy, value));

      case CompanySettingSubject.name:
        params = ['id', 'companyId'];
        return new CompanySettingSubject(await this.#find(CompanySettingEntity, params, option.findBy, value));

      case ExchangeRateSubject.name:
        params = ['id'];
        return new ExchangeRateSubject(await this.#find(ExchangeRateSubject, params, option.findBy, value));

      case IntegrationSubject.name:
        params = ['id', 'companyId'];
        return new IntegrationSubject(await this.#find(IntegrationEntity, params, option.findBy, value));

      case LoyaltySubject.name:
        params = ['id', 'userId', 'companyId'];
        return new LoyaltySubject(await this.#find(LoyaltyEntity, params, option.findBy, value));

      case LoyaltyHistorySubject.name:
        params = ['id', 'userId', 'companyId'];
        return new LoyaltyHistorySubject(await this.#find(LoyaltyHistoryEntity, params, option.findBy, value));

      case OrganisationSubject.name:
        params = ['id'];
        return new OrganisationSubject(await this.#find(OrganisationEntity, params, option.findBy, value));

      case PaymentTransactionSubject.name:
        params = ['id', 'userId', 'companyId'];
        return new PaymentTransactionSubject(await this.#find(PaymentTransactionEntity, params, option.findBy, value));

      case PlatformClientSubject.name:
        params = ['id', 'companyId'];
        return new PlatformClientSubject(await this.#find(PlatformClientEntity, params, option.findBy, value));

      case ServerSubject.name:
        params = ['id', 'companyId'];
        return new ServerSubject(await this.#find(ServerEntity, params, option.findBy, value));

      case TagSubject.name:
        params = ['id', 'companyId'];
        return new TagSubject(await this.#find(TagEntity, params, option.findBy, value));

      case TradingAccountSubject.name:
        params = ['id', 'userId', 'companyId'];
        return new TradingAccountSubject(await this.#find(TradingAccountEntity, params, option.findBy, value));

      case TradingAccountNoteSubject.name:
        params = ['id', 'authorId', 'companyId'];
        return new TradingAccountNoteSubject(await this.#find(TradingAccountNoteEntity, params, option.findBy, value));

      case TradingAccountTagSubject.name:
        params = ['id', 'companyId'];
        return new TradingAccountTagSubject(await this.#find(TradingAccountTagEntity, params, option.findBy, value));

      case TradingAccountTypeSubject.name:
        params = ['id', 'companyId'];
        return new PaymentTransactionSubject(await this.#find(TradingAccountTypeEntity, params, option.findBy, value));

      case TradingAccountTypeLeverageSubject.name:
        params = ['id', 'companyId'];
        return new PaymentTransactionSubject(
          await this.#find(TradingAccountTypeLeverageEntity, params, option.findBy, value),
        );

      case TradingEventSubject.name:
        params = ['id'];
        return new TradingEventSubject(await this.#find(TradingEventEntity, params, option.findBy, value));

      case UserSubject.name:
        params = ['id', 'companyId'];
        return new UserSubject(await this.#find(UserEntity, params, option.findBy, value));

      case UserAuthSessionSubject.name:
        params = ['id', 'userId', 'companyId'];
        return new UserAuthSessionSubject(await this.#find(UserAuthSessionEntity, params, option.findBy, value));

      case UserAvatarSubject.name:
        params = ['id', 'userId', 'companyId'];
        return new UserAvatarSubject(await this.#find(UserAvatarEntity, params, option.findBy, value));

      case UserCompanySubject.name:
        params = ['id', 'userId', 'companyId'];
        return new UserCompanySubject(await this.#find(UserCompanyEntity, params, option.findBy, value));

      case UserDetailSubject.name:
        params = ['id', 'userId', 'companyId'];
        return new UserDetailSubject(await this.#find(UserDetailEntity, params, option.findBy, value));

      case UserDocumentSubject.name:
        params = ['id', 'userId', 'companyId'];
        return new UserDocumentSubject(await this.#find(UserDocumentEntity, params, option.findBy, value));

      case UserNoteSubject.name:
        params = ['id', 'userId', 'companyId'];
        return new UserNoteSubject(await this.#find(UserNoteEntity, params, option.findBy, value));

      case UserNotificationSubject.name:
        params = ['id', 'userId', 'companyId'];
        return new UserNotificationSubject(await this.#find(UserNotificationEntity, params, option.findBy, value));

      case UserSettingSubject.name:
        params = ['id', 'userId', 'companyId'];
        return new UserSettingSubject(await this.#find(UserSettingEntity, params, option.findBy, value));

      case WalletSubject.name:
        params = ['id', 'userId', 'companyId'];
        return new WalletSubject(await this.#find(WalletEntity, params, option.findBy, value));

      case WalletTransactionSubject.name:
        params = ['id', 'userId', 'companyId'];
        return new WalletTransactionSubject(await this.#find(WalletTransactionEntity, params, option.findBy, value));

      case WalletTransactionHistorySubject.name:
        params = ['id', 'userId', 'companyId'];
        return new WalletTransactionHistorySubject(
          await this.#find(WalletTransactionHistoryEntity, params, option.findBy, value),
        );

      case WheelSpinSubject.name:
        params = ['id', 'userId', 'companyId'];
        return new WheelSpinSubject(await this.#find(WheelSpinEntity, params, option.findBy, value));

      default:
        throw new InvalidSubjectException(subject.name);
    }
  }

  /**
   * Returns the construction params for a subject based on a database entity
   * @param target
   * @param select
   * @param findBy
   * @param value
   * @private
   */
  async #find<T = EntityTarget<ObjectLiteral>>(
    target: EntityTarget<any>,
    select: string[],
    findBy: string,
    value: unknown,
  ): Promise<T> {
    const entity =
      (await this.dataSource
        .createQueryBuilder()
        .from(target, 'e')
        .select(select)
        .where(`e."${findBy}" = :value`, { value })
        .getRawOne()) ?? {};

    entity[findBy] = value;
    return entity;
  }
}
