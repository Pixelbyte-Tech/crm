import {
  Index,
  Entity,
  Column,
  Unique,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Platform, Monetization, TradingAccountStatus } from '@crm/types';

import { UserEntity } from './user.entity';
import { ServerEntity } from './server.entity';
import { CompanyEntity } from './company.entity';
import { TradingAccountNote } from './trading-account-note.entity';
import { WalletTransactionEntity } from './wallet-transaction.entity';
import { TradingAccountTagEntity } from './trading-account-tag.entity';
import { WalletTransactionHistoryEntity } from './wallet-transaction-history.entity';

@Entity({ name: 'trading_account' })
@Unique(['serverId', 'platformId'])
export class TradingAccountEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  platformId: string;

  @Column({ type: 'text', nullable: true })
  platformUserId?: string | null;

  @Column({ type: 'text', nullable: true })
  platformAccountName?: string | null;

  @Column({ type: 'text', nullable: true })
  friendlyName?: string | null;

  @Column({ type: 'enum', enum: Platform })
  platform: Platform;

  @Column({ type: 'enum', enum: Monetization })
  monetization: Monetization;

  @Column({ type: 'enum', enum: TradingAccountStatus })
  status: TradingAccountStatus;

  @Column({ type: 'timestamp' })
  registeredAt: Date;

  @Column({ type: 'text' })
  login: string;

  @Column({ type: 'text' })
  password: string;

  /** One-to-many relations */
  @OneToMany(() => TradingAccountNote, (e) => e.tradingAccount)
  @JoinColumn()
  notes: TradingAccountNote[];

  @OneToMany(() => TradingAccountTagEntity, (e) => e.tradingAccount)
  @JoinColumn()
  tradingAccountTags: TradingAccountTagEntity[];

  @OneToMany(() => WalletTransactionEntity, (e) => e.tradingAccount)
  @JoinColumn()
  walletTransactions: WalletTransactionEntity[];

  @OneToMany(() => WalletTransactionHistoryEntity, (e) => e.tradingAccount)
  @JoinColumn()
  walletTransactionHistory: WalletTransactionHistoryEntity[];

  /** Many-to-many relations */
  @ManyToOne(() => CompanyEntity, (e) => e.tradingAccounts, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'companyId' })
  company: CompanyEntity;

  @Index()
  @Column({ type: 'text' })
  companyId: string;

  @ManyToOne(() => ServerEntity, (e) => e.tradingAccounts, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'serverId' })
  server: ServerEntity;

  @Index()
  @Column({ type: 'text' })
  serverId: string;

  @ManyToOne(() => UserEntity, (e) => e.tradingAccounts, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Index()
  @Column({ type: 'text' })
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
