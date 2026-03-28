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

import { Platform, Monetisation, TradingAccountStatus } from '@crm/types';

import { UserEntity } from './user.entity';
import { ServerEntity } from './server.entity';
import { WalletTransactionEntity } from './wallet-transaction.entity';
import { TradingAccountTagEntity } from './trading-account-tag.entity';
import { TradingAccountNoteEntity } from './trading-account-note.entity';
import { TradingAccountSchemaEntity } from './trading-account-schema.entity';
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

  @Column({ type: 'enum', enum: Monetisation })
  monetisation: Monetisation;

  @Column({ type: 'enum', enum: TradingAccountStatus })
  status: TradingAccountStatus;

  @Column({ type: 'smallint' })
  leverage: number;

  @Column({ type: 'varchar', length: 3 })
  currency: string;

  @Column({ type: 'timestamp' })
  registeredAt: Date;

  @Column({ type: 'text' })
  login: string;

  @Column({ type: 'text' })
  password: string;

  /** One-to-many relations */
  @OneToMany(() => TradingAccountNoteEntity, (e) => e.tradingAccount)
  @JoinColumn()
  notes: TradingAccountNoteEntity[];

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
  @ManyToOne(() => TradingAccountSchemaEntity, (e) => e.tradingAccounts, {
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'schemaId' })
  schema?: TradingAccountSchemaEntity | null;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  schemaId?: string | null;

  @ManyToOne(() => ServerEntity, (e) => e.tradingAccounts, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'serverId' })
  server: ServerEntity;

  @Index()
  @Column({ type: 'uuid' })
  serverId: string;

  @ManyToOne(() => UserEntity, (e) => e.tradingAccounts, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Index()
  @Column({ type: 'uuid' })
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
