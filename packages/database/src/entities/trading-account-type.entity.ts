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

import { ServerEntity } from './server.entity';
import { TradingAccountTypeLeverageEntity } from './trading-account-type-leverage.entity';

@Entity({ name: 'trading_account_type' })
@Unique(['name'])
export class TradingAccountTypeEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'boolean', default: false })
  isEnabled: boolean;

  @Column({ type: 'boolean', default: false })
  isKycRequired: boolean;

  @Column({ type: 'int', array: true, nullable: true })
  allowedLeverages?: number[] | null;

  @Column({ type: 'varchar', length: 3, array: true, nullable: true })
  allowedCurrencies?: string[] | null;

  @Column({ type: 'varchar', length: 3, array: true, nullable: true })
  allowedCountries?: string[] | null;

  @Column({ type: 'varchar', length: 3, array: true, nullable: true })
  excludedCountries?: string[] | null;

  @Column({ type: 'decimal', nullable: true })
  minDepositAmountUsd?: number | null;

  @Column({ type: 'decimal', nullable: true })
  maxDepositAmountUsd?: number | null;

  @Column({ type: 'int', nullable: true })
  maxAccountsPerUser?: number | null;

  @Column({ type: 'text', nullable: true })
  userGroupName?: string | null;

  @Column({ type: 'text' })
  platformUserGroupId: string;

  /** One-to-many relations */
  @OneToMany(() => TradingAccountTypeLeverageEntity, (e) => e.tradingAccountType)
  @JoinColumn()
  tradingAccountTypeLeverages: TradingAccountTypeLeverageEntity[];

  /** Many-to-many relations */
  @ManyToOne(() => ServerEntity, (e) => e.tradingAccountTypes, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'serverId' })
  server: ServerEntity;

  @Index()
  @Column({ type: 'text' })
  serverId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
