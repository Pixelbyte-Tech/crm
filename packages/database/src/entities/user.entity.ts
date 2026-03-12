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

import { UserStatus } from '@crm/types';

import { WalletEntity } from './wallet.entity';
import { CompanyEntity } from './company.entity';
import { LoyaltyEntity } from './loyalty.entity';
import { UserNoteEntity } from './user-note.entity';
import { WheelSpinEntity } from './wheel-spin.entity';
import { UserAvatarEntity } from './user-avatar.entity';
import { UserDetailEntity } from './user-detail.entity';
import { UserSettingEntity } from './user-setting.entity';
import { UserDocumentEntity } from './user-document.entity';
import { TradingAccountEntity } from './trading-account.entity';
import { LoyaltyHistoryEntity } from './loyalty-history.entity';
import { UserAuthSessionEntity } from './user-auth-session.entity';
import { UserNotificationEntity } from './user-notification.entity';
import { WalletTransactionEntity } from './wallet-transaction.entity';
import { PaymentTransactionEntity } from './payment-transaction.entity';
import { WalletTransactionHistoryEntity } from './wallet-transaction-history.entity';

@Entity({ name: 'user' })
@Unique(['detailId'])
@Unique(['settingsId'])
@Unique(['companyId', 'email'])
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

  @Column({ type: 'bool', default: false })
  isEmailVerified: boolean;

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
  })
  @JoinColumn({ name: 'avatarId' })
  avatar?: UserAvatarEntity | null;

  @Index()
  @Column({ type: 'text', nullable: true })
  avatarId?: string | null;

  @OneToOne(() => UserDetailEntity, (e) => e.user, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'userDetailId' })
  detail?: UserDetailEntity | null;

  @Index()
  @Column({ type: 'text', nullable: true })
  detailId?: string | null;

  @OneToOne(() => UserSettingEntity, (e) => e.user, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'settingsId' })
  settings: UserSettingEntity;

  @Index()
  @Column({ type: 'text' })
  settingsId: string;

  @OneToOne(() => LoyaltyEntity, (e) => e.user)
  @JoinColumn()
  loyalty: LoyaltyEntity[];

  /** One-to-many relations */
  @OneToMany(() => UserAuthSessionEntity, (e) => e.user)
  @JoinColumn()
  authSessions: UserAuthSessionEntity[];

  @OneToMany(() => UserDocumentEntity, (e) => e.user)
  @JoinColumn()
  documents: UserDocumentEntity[];

  @OneToMany(() => LoyaltyHistoryEntity, (e) => e.user)
  @JoinColumn()
  loyaltyHistory: LoyaltyHistoryEntity[];

  @OneToMany(() => UserNoteEntity, (e) => e.user)
  @JoinColumn()
  notes: UserNoteEntity[];

  @OneToMany(() => UserNotificationEntity, (e) => e.user)
  @JoinColumn()
  notifications: UserNotificationEntity[];

  @OneToMany(() => PaymentTransactionEntity, (e) => e.user)
  @JoinColumn()
  paymentTransactions: PaymentTransactionEntity[];

  @OneToMany(() => TradingAccountEntity, (e) => e.user)
  @JoinColumn()
  tradingAccounts: TradingAccountEntity[];

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

  /** Many-to-one relations */
  @ManyToOne(() => CompanyEntity, (e) => e.users, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'companyId' })
  company: CompanyEntity;

  @Index()
  @Column({ type: 'text' })
  companyId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
