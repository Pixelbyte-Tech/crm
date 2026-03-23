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

import { WalletTransactionType, WalletTransactionStatus } from '@crm/types';

import { UserEntity } from './user.entity';
import { WalletEntity } from './wallet.entity';
import { TradingAccountEntity } from './trading-account.entity';

@Entity({ name: 'wallet_transaction' })
export class WalletTransactionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  externalId?: string | null;

  @Index()
  @Column({ type: 'enum', enum: WalletTransactionType })
  type: WalletTransactionType;

  @Index()
  @Column({ type: 'enum', enum: WalletTransactionStatus })
  status: WalletTransactionStatus;

  @Column({ type: 'decimal' })
  amount: number;

  @Column({ type: 'decimal' })
  balanceBefore: number;

  @Column({ type: 'decimal' })
  balanceAfter: number;

  @Column({ type: 'varchar', nullable: true })
  ipAddress?: string | null;

  @Column({ type: 'text', nullable: true })
  comment?: string | null;

  /** Many-to-one relations */
  @ManyToOne(() => TradingAccountEntity, (e) => e.walletTransactions, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'tradingAccountId' })
  tradingAccount?: TradingAccountEntity | null;

  @Index()
  @Column({ type: 'text', nullable: true })
  tradingAccountId?: string | null;

  @ManyToOne(() => UserEntity, (e) => e.walletTransactions, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Index()
  @Column({ type: 'text' })
  userId: string;

  @ManyToOne(() => WalletEntity, (e) => e.transactions, {
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
