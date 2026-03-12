import {
  Index,
  Entity,
  Column,
  Unique,
  OneToOne,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { CompanyType } from '@crm/types';

import { TagEntity } from './tag.entity';
import { UserEntity } from './user.entity';
import { AlertEntity } from './alert.entity';
import { ServerEntity } from './server.entity';
import { WalletEntity } from './wallet.entity';
import { ChannelEntity } from './channel.entity';
import { LoyaltyEntity } from './loyalty.entity';
import { AuditLogEntity } from './audit-log.entity';
import { UserNoteEntity } from './user-note.entity';
import { WheelSpinEntity } from './wheel-spin.entity';
import { UserDetailEntity } from './user-detail.entity';
import { UserAvatarEntity } from './user-avatar.entity';
import { IntegrationEntity } from './integration.entity';
import { BillingInfoEntity } from './billing-info.entity';
import { UserSettingEntity } from './user-setting.entity';
import { OrganisationEntity } from './organisation.entity';
import { UserDocumentEntity } from './user-document.entity';
import { TenantCompanyEntity } from './tenant-company.entity';
import { CompanySettingEntity } from './company-setting.entity';
import { PlatformClientEntity } from './platform-client.entity';
import { TradingAccountEntity } from './trading-account.entity';
import { LoyaltyHistoryEntity } from './loyalty-history.entity';
import { UserAuthSessionEntity } from './user-auth-session.entity';
import { TradingAccountNote } from './trading-account-note.entity';
import { UserNotificationEntity } from './user-notification.entity';
import { WalletTransactionEntity } from './wallet-transaction.entity';
import { TenantAuthSessionEntity } from './tenant-auth-session.entity';
import { PaymentTransactionEntity } from './payment-transaction.entity';
import { TradingAccountTypeEntity } from './trading-account-type.entity';
import { WalletTransactionHistoryEntity } from './wallet-transaction-history.entity';
import { TradingAccountTypeLeverageEntity } from './trading-account-type-leverage.entity';

@Entity({ name: 'company' })
@Unique(['billingInfoId'])
@Unique(['domain'])
@Unique(['name', 'type'])
export class CompanyEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'enum', enum: CompanyType })
  type: CompanyType;

  @Column({ type: 'text' })
  domain: string;

  /** One-to-one relations */
  @OneToOne(() => BillingInfoEntity, (e) => e.company, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'billingInfoId' })
  billingInfo: BillingInfoEntity;

  @Index()
  @Column({ type: 'text' })
  billingInfoId: string;

  /** One-to-many relations */
  @OneToMany(() => AlertEntity, (e) => e.company)
  @JoinColumn()
  alerts: AlertEntity[];

  @OneToMany(() => AuditLogEntity, (e) => e.company)
  @JoinColumn()
  auditLogs: AuditLogEntity[];

  @OneToMany(() => ChannelEntity, (e) => e.company)
  @JoinColumn()
  channels: ChannelEntity[];

  @OneToMany(() => IntegrationEntity, (e) => e.company)
  @JoinColumn()
  integrations: IntegrationEntity[];

  @OneToMany(() => LoyaltyEntity, (e) => e.company)
  @JoinColumn()
  loyalty: LoyaltyEntity[];

  @OneToMany(() => LoyaltyHistoryEntity, (e) => e.company)
  @JoinColumn()
  loyaltyHistory: LoyaltyHistoryEntity[];

  @OneToMany(() => PaymentTransactionEntity, (e) => e.company)
  @JoinColumn()
  paymentTransactions: PaymentTransactionEntity[];

  @OneToMany(() => PlatformClientEntity, (e) => e.company)
  @JoinColumn()
  platformClients: PlatformClientEntity[];

  @OneToMany(() => ServerEntity, (e) => e.company)
  @JoinColumn()
  servers: ServerEntity[];

  @OneToMany(() => CompanySettingEntity, (e) => e.company)
  @JoinColumn()
  settings: CompanySettingEntity[];

  @OneToMany(() => TagEntity, (e) => e.company)
  @JoinColumn()
  tags: TagEntity[];

  @OneToMany(() => TenantAuthSessionEntity, (e) => e.company)
  @JoinColumn()
  tenantAuthSessions: TenantAuthSessionEntity[];

  @OneToMany(() => TenantCompanyEntity, (e) => e.company)
  @JoinColumn()
  tenantCompanies: TenantCompanyEntity[];

  @OneToMany(() => TradingAccountEntity, (e) => e.company)
  @JoinColumn()
  tradingAccounts: TradingAccountEntity[];

  @OneToMany(() => TradingAccountNote, (e) => e.company)
  @JoinColumn()
  tradingAccountNotes: TradingAccountNote[];

  @OneToMany(() => TradingAccountTypeEntity, (e) => e.company)
  @JoinColumn()
  tradingAccountTypes: TradingAccountTypeEntity[];

  @OneToMany(() => TradingAccountTypeLeverageEntity, (e) => e.company)
  @JoinColumn()
  tradingAccountTypeLeverages: TradingAccountTypeLeverageEntity[];

  @OneToMany(() => UserEntity, (e) => e.company)
  @JoinColumn()
  users: UserEntity[];

  @OneToMany(() => UserAvatarEntity, (e) => e.company)
  @JoinColumn()
  userAvatars: UserAvatarEntity[];

  @OneToMany(() => UserAuthSessionEntity, (e) => e.company)
  @JoinColumn()
  userAuthSessions: UserAuthSessionEntity[];

  @OneToMany(() => UserDetailEntity, (e) => e.company)
  @JoinColumn()
  userDetails: UserDetailEntity[];

  @OneToMany(() => UserDocumentEntity, (e) => e.company)
  @JoinColumn()
  userDocuments: UserDocumentEntity[];

  @OneToMany(() => UserNotificationEntity, (e) => e.company)
  @JoinColumn()
  userNotifications: UserNotificationEntity[];

  @OneToMany(() => UserNoteEntity, (e) => e.company)
  @JoinColumn()
  userNotes: UserNoteEntity[];

  @OneToMany(() => UserSettingEntity, (e) => e.company)
  @JoinColumn()
  userSettings: UserSettingEntity[];

  @OneToMany(() => WalletEntity, (e) => e.company)
  @JoinColumn()
  wallets: WalletEntity[];

  @OneToMany(() => WalletTransactionEntity, (e) => e.company)
  @JoinColumn()
  walletTransactions: WalletTransactionEntity[];

  @OneToMany(() => WalletTransactionHistoryEntity, (e) => e.company)
  @JoinColumn()
  walletTransactionHistory: WalletTransactionHistoryEntity[];

  @OneToMany(() => WheelSpinEntity, (e) => e.company)
  @JoinColumn()
  wheelSpins: WheelSpinEntity[];

  /** Many-to-one relations */
  @ManyToOne(() => OrganisationEntity, (e) => e.companies, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'organisationId' })
  organisation: OrganisationEntity;

  @Index()
  @Column({ type: 'text' })
  organisationId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
