import {
  Index,
  Entity,
  Column,
  Unique,
  OneToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Role, UserStatus } from '@crm/types';

import { WalletEntity } from './wallet.entity';
import { LoyaltyEntity } from './loyalty.entity';
import { UserNoteEntity } from './user-note.entity';
import { AuditLogEntity } from './audit-log.entity';
import { WheelSpinEntity } from './wheel-spin.entity';
import { InvitationEntity } from './invitation.entity';
import { UserAvatarEntity } from './user-avatar.entity';
import { UserDetailEntity } from './user-detail.entity';
import { UserRewardEntity } from './user-reward.entity';
import { UserSettingEntity } from './user-setting.entity';
import { UserDocumentEntity } from './user-document.entity';
import { TradingAccountEntity } from './trading-account.entity';
import { LoyaltyHistoryEntity } from './loyalty-history.entity';
import { UserMysteryBoxEntity } from './user-mystery-box.entity';
import { UserAuthSessionEntity } from './user-auth-session.entity';
import { UserNotificationEntity } from './user-notification.entity';
import { WalletTransactionEntity } from './wallet-transaction.entity';
import { TradingAccountTagEntity } from './trading-account-tag.entity';
import { PaymentTransactionEntity } from './payment-transaction.entity';
import { TradingAccountNoteEntity } from './trading-account-note.entity';
import { UserInAppNotificationEntity } from './user-in-app-notification.entity';
import { WalletTransactionHistoryEntity } from './wallet-transaction-history.entity';

@Entity({ name: 'user' })
@Unique(['detailId'])
@Unique(['settingsId'])
@Unique(['loyaltyId'])
@Unique(['email'])
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  firstName: string;

  @Column({ type: 'text', nullable: true })
  middleName?: string | null;

  @Column({ type: 'text' })
  lastName: string;

  @Index()
  @Column({ type: 'text' })
  email: string;

  @Column({ type: 'text' })
  passwordHash: string;

  @Column({ type: 'varchar' })
  securityPin: string;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @Column({ type: 'enum', enum: Role, array: true })
  roles: Role[];

  @Column({ type: 'bool', default: false })
  isEmailVerified: boolean;

  @Column({ type: 'timestamp', nullable: true })
  emailVerifiedAt?: Date | null;

  @Column({ type: 'bool', default: false })
  isTermsAccepted: boolean;

  @Column({ type: 'timestamp', nullable: true })
  termsAcceptedAt?: Date | null;

  @Column({ type: 'bool', default: false })
  isPrivacyAccepted: boolean;

  @Column({ type: 'timestamp', nullable: true })
  privacyAcceptedAt?: Date | null;

  @Column({ type: 'bool', default: false })
  isCookiesAccepted: boolean;

  @Column({ type: 'timestamp', nullable: true })
  cookiesAcceptedAt?: Date | null;

  /** One-to-one relations */
  @OneToOne(() => UserAvatarEntity, (e) => e.user, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    nullable: true,
    cascade: true, // This allows insert of entity in save()
  })
  @JoinColumn({ name: 'avatarId' })
  avatar?: UserAvatarEntity | null;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  avatarId?: string | null;

  @OneToOne(() => UserDetailEntity, (e) => e.user, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    nullable: true,
    cascade: true, // This allows insert of entity in save()
  })
  @JoinColumn({ name: 'detailId', referencedColumnName: 'id' })
  detail?: UserDetailEntity | null;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  detailId?: string | null;

  @OneToOne(() => LoyaltyEntity, (e) => e.user, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    cascade: true, // This allows insert of entity in save()
  })
  @JoinColumn({ name: 'loyaltyId' })
  loyalty: LoyaltyEntity;

  @Index()
  @Column({ type: 'uuid' })
  loyaltyId: string;

  @OneToOne(() => UserSettingEntity, (e) => e.user, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    cascade: true, // This allows insert of entity in save()
  })
  @JoinColumn({ name: 'settingsId', referencedColumnName: 'id' })
  settings: UserSettingEntity;

  @Index()
  @Column({ type: 'uuid' })
  settingsId: string;

  /** One-to-many relations */
  @OneToMany(() => AuditLogEntity, (e) => e.user)
  @JoinColumn()
  auditLogs: AuditLogEntity[];

  @OneToMany(() => UserAuthSessionEntity, (e) => e.user)
  @JoinColumn()
  authSessions: UserAuthSessionEntity[];

  @OneToMany(() => UserDocumentEntity, (e) => e.user)
  @JoinColumn()
  documents: UserDocumentEntity[];

  @OneToMany(() => UserInAppNotificationEntity, (e) => e.user)
  @JoinColumn()
  inAppNotifications: UserInAppNotificationEntity[];

  @OneToMany(() => LoyaltyHistoryEntity, (e) => e.user)
  @JoinColumn()
  loyaltyHistory: LoyaltyHistoryEntity[];

  @OneToMany(() => UserMysteryBoxEntity, (e) => e.user)
  @JoinColumn()
  mysteryBoxes: UserMysteryBoxEntity[];

  @OneToMany(() => UserNotificationEntity, (e) => e.user)
  @JoinColumn()
  notifications: UserNotificationEntity[];

  @OneToMany(() => PaymentTransactionEntity, (e) => e.user)
  @JoinColumn()
  paymentTransactions: PaymentTransactionEntity[];

  @OneToMany(() => UserRewardEntity, (e) => e.user)
  @JoinColumn()
  rewards: UserRewardEntity[];

  @OneToMany(() => UserRewardEntity, (e) => e.awardedByUserId)
  @JoinColumn()
  rewardsGiven: UserRewardEntity[];

  @OneToMany(() => InvitationEntity, (e) => e.sentByUser)
  @JoinColumn()
  sentInvitations: InvitationEntity[];

  @OneToMany(() => TradingAccountEntity, (e) => e.user)
  @JoinColumn()
  tradingAccounts: TradingAccountEntity[];

  @OneToMany(() => TradingAccountNoteEntity, (e) => e.author)
  @JoinColumn()
  tradingAccountAuthoredNotes: TradingAccountNoteEntity[];

  @OneToMany(() => TradingAccountTagEntity, (e) => e.taggedByUser)
  @JoinColumn()
  tradingAccountTags: TradingAccountTagEntity[];

  @OneToMany(() => UserNoteEntity, (e) => e.author)
  @JoinColumn()
  userAuthoredNotes: UserNoteEntity[];

  @OneToMany(() => UserNoteEntity, (e) => e.user)
  @JoinColumn()
  userNotes: UserNoteEntity[];

  @OneToMany(() => WalletEntity, (e) => e.user)
  @JoinColumn()
  wallets: WalletEntity[];

  @OneToMany(() => WalletTransactionEntity, (e) => e.user)
  @JoinColumn()
  walletTransactions: WalletTransactionEntity[];

  @OneToMany(() => WalletTransactionHistoryEntity, (e) => e.user)
  @JoinColumn()
  walletTransactionHistory: WalletTransactionHistoryEntity[];

  @OneToMany(() => WheelSpinEntity, (e) => e.user)
  @JoinColumn()
  wheelSpins: WheelSpinEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
