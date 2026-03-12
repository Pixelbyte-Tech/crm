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

import { AssetType } from '@crm/types';

import { UserEntity } from './user.entity';
import { CompanyEntity } from './company.entity';
import { WalletTransactionEntity } from './wallet-transaction.entity';
import { WalletTransactionHistoryEntity } from './wallet-transaction-history.entity';

@Entity({ name: 'wallet' })
@Unique(['userId', 'currency'])
export class WalletEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  friendlyName?: string | null;

  @Index()
  @Column({ type: 'enum', enum: AssetType })
  assetType: AssetType;

  @Column({ type: 'decimal' })
  balance: number;

  @Index()
  @Column({ type: 'varchar', length: 3 })
  currency: string;

  /** One-to-many relations */
  @OneToMany(() => WalletTransactionEntity, (e) => e.wallet)
  @JoinColumn()
  transactions: WalletTransactionEntity[];

  @OneToMany(() => WalletTransactionHistoryEntity, (e) => e.wallet)
  @JoinColumn()
  transactionHistory: WalletTransactionHistoryEntity[];

  /** Many-to-one relations */
  @ManyToOne(() => CompanyEntity, (e) => e.wallets, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'companyId' })
  company: CompanyEntity;

  @Index()
  @Column({ type: 'text' })
  companyId: string;

  @ManyToOne(() => UserEntity, (e) => e.wallets, {
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
