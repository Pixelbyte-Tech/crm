import {
  Index,
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { WalletTransactionStatus } from '@crm/types';

import { UserEntity } from './user.entity';
import { WalletEntity } from './wallet.entity';
import { CompanyEntity } from './company.entity';
import { TradingAccountEntity } from './trading-account.entity';

@Entity({ name: 'wallet_transaction_history' })
export class WalletTransactionHistoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'enum', enum: WalletTransactionStatus })
  status: WalletTransactionStatus;

  @Column({ type: 'text', nullable: true })
  comment?: string | null;

  @Index()
  @Column({ type: 'timestamp' })
  occurredAt: Date;

  /** Many-to-one relations */
  @ManyToOne(() => CompanyEntity, (e) => e.walletTransactionHistory, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'companyId' })
  company: CompanyEntity;

  @Index()
  @Column({ type: 'text' })
  companyId: string;

  @ManyToOne(() => TradingAccountEntity, (e) => e.walletTransactionHistory, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'tradingAccountId' })
  tradingAccount?: TradingAccountEntity | null;

  @Index()
  @Column({ type: 'text', nullable: true })
  tradingAccountId?: string | null;

  @ManyToOne(() => UserEntity, (e) => e.walletTransactionHistory, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Index()
  @Column({ type: 'text' })
  userId: string;

  @ManyToOne(() => WalletEntity, (e) => e.transactionHistory, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'walletId' })
  wallet: WalletEntity;

  @Index()
  @Column({ type: 'text' })
  walletId: string;

  @PrimaryColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
