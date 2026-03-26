import { Type, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, ObjectLiteral } from 'typeorm';
import { EntityTarget } from 'typeorm/common/EntityTarget';

import {
  UserEntity,
  WalletEntity,
  LoyaltyEntity,
  AuditLogEntity,
  UserNoteEntity,
  WheelSpinEntity,
  UserDetailEntity,
  UserAvatarEntity,
  InvitationEntity,
  UserSettingEntity,
  UserDocumentEntity,
  LoyaltyHistoryEntity,
  TradingAccountEntity,
  UserAuthSessionEntity,
  WalletTransactionEntity,
  PaymentTransactionEntity,
  TradingAccountNoteEntity,
  TradingAccountSchemaEntity,
  UserInAppNotificationEntity,
  WalletTransactionHistoryEntity,
} from '@crm/database';

import { Subject, SubjectFilter } from '../types';
import { AuthenticatedReq } from '../../../types';
import { InvalidSubjectException } from '../exceptions';
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
  UserDetailSubject,
  UserAvatarSubject,
  InvitationSubject,
  IntegrationSubject,
  UserSettingSubject,
  ExchangeRateSubject,
  TradingEventSubject,
  UserDocumentSubject,
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
  TradingAccountSchemaSubject,
  WalletTransactionHistorySubject,
  TradingAccountSchemaLeverageSubject,
} from '../subjects';

@Injectable()
export class SubjectFactory {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Creates the subject object for the provided subject id
   * @param req The request context to find the subject from
   * @param subject The type of subject to create
   * @param filter The instructions on how to find the subject from the request context
   */
  async create(
    req: AuthenticatedReq,
    subject: Type<Subject>,
    filter?: SubjectFilter<typeof subject>,
  ): Promise<Subject> {
    switch (subject.name) {
      case AlertSubject.name:
        return new AlertSubject();

      case AuditLogSubject.name:
        return new AuditLogSubject(await this.#find(AuditLogEntity, ['userId'], req, filter));

      case ChannelSubject.name:
        return new ChannelSubject();

      case InvitationSubject.name:
        return new InvitationSubject(await this.#find(InvitationEntity, ['sentByUserId'], req, filter));

      case GlobalSettingSubject.name:
        return new GlobalSettingSubject();

      case ExchangeRateSubject.name:
        return new ExchangeRateSubject();

      case IntegrationSubject.name:
        return new IntegrationSubject();

      case LoyaltySubject.name:
        return new LoyaltySubject(await this.#find(LoyaltyEntity, ['userId'], req, filter));

      case LoyaltyHistorySubject.name:
        return new LoyaltyHistorySubject(await this.#find(LoyaltyHistoryEntity, ['userId'], req, filter));

      case PaymentTransactionSubject.name:
        return new PaymentTransactionSubject(await this.#find(PaymentTransactionEntity, ['userId'], req, filter));

      case PlatformClientSubject.name:
        return new PlatformClientSubject();

      case ServerSubject.name:
        return new ServerSubject();

      case TagSubject.name:
        return new TagSubject();

      case TradingAccountSubject.name:
        return new TradingAccountSubject(await this.#find(TradingAccountEntity, ['userId'], req, filter));

      case TradingAccountNoteSubject.name:
        return new TradingAccountNoteSubject(await this.#find(TradingAccountNoteEntity, ['authorId'], req, filter));

      case TradingAccountTagSubject.name:
        return new TradingAccountTagSubject();

      case TradingAccountSchemaSubject.name:
        return new PaymentTransactionSubject(await this.#find(TradingAccountSchemaEntity, ['userId'], req, filter));

      case TradingAccountSchemaLeverageSubject.name:
        return new TradingAccountSchemaLeverageSubject();

      case TradingEventSubject.name:
        return new TradingEventSubject();

      case UserSubject.name:
        return new UserSubject(await this.#find(UserEntity, ['id'], req, filter));

      case UserAuthSessionSubject.name:
        return new UserAuthSessionSubject(await this.#find(UserAuthSessionEntity, ['userId'], req, filter));

      case UserAvatarSubject.name:
        return new UserAvatarSubject(await this.#find(UserAvatarEntity, ['userId'], req, filter));

      case UserDetailSubject.name:
        return new UserDetailSubject(await this.#find(UserDetailEntity, ['userId'], req, filter));

      case UserDocumentSubject.name:
        return new UserDocumentSubject(await this.#find(UserDocumentEntity, ['userId'], req, filter));

      case UserNoteSubject.name:
        return new UserNoteSubject(await this.#find(UserNoteEntity, ['userId', 'authorId'], req, filter));

      case UserNotificationSubject.name:
        return new UserNotificationSubject(await this.#find(UserInAppNotificationEntity, ['userId'], req, filter));

      case UserSettingSubject.name:
        return new UserSettingSubject(await this.#find(UserSettingEntity, ['userId'], req, filter));

      case WalletSubject.name:
        return new WalletSubject(await this.#find(WalletEntity, ['userId'], req, filter));

      case WalletTransactionSubject.name:
        return new WalletTransactionSubject(await this.#find(WalletTransactionEntity, ['userId'], req, filter));

      case WalletTransactionHistorySubject.name:
        return new WalletTransactionHistorySubject(
          await this.#find(WalletTransactionHistoryEntity, ['userId'], req, filter),
        );

      case WheelSpinSubject.name:
        return new WheelSpinSubject(await this.#find(WheelSpinEntity, ['userId'], req, filter));

      default:
        throw new InvalidSubjectException(subject.name);
    }
  }

  /**
   * Returns the construction params for a subject based on a database entity
   * @param target
   * @param select
   * @param req
   * @param filter
   * @private
   */
  async #find<T = EntityTarget<ObjectLiteral>>(
    target: EntityTarget<any>,
    select: string[],
    req: AuthenticatedReq,
    filter?: SubjectFilter,
  ): Promise<T | undefined> {
    if (!filter) {
      return;
    }

    const value = req[filter.in][filter.use];

    const entity =
      (await this.dataSource
        .createQueryBuilder()
        .from(target, 'e')
        .select(select.map((s) => `e."${s}"`))
        .where(`e."${filter.findBy.toString()}" = :value`, { value })
        .getRawOne()) ?? {};

    entity[filter.findBy] = value;
    return entity;
  }
}
