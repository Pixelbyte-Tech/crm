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
import { TradingAccountEntity } from './trading-account.entity';
import { TradingAccountSchemaLeverageEntity } from './trading-account-schema-leverage.entity';

@Entity({ name: 'trading_account_schema' })
@Unique(['name'])
@Unique(['serverId', 'platformUserGroupId'])
export class TradingAccountSchemaEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'boolean', default: false })
  isEnabled: boolean;

  @Column({ type: 'boolean', default: false })
  isPoiRequired: boolean;

  @Column({ type: 'boolean', default: false })
  isPowRequired: boolean;

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

  @Column({ type: 'smallint', nullable: true })
  maxAccountsPerUser?: number | null;

  @Column({ type: 'text' })
  platformUserGroupId: string;

  /** One-to-many relations */
  @OneToMany(() => TradingAccountSchemaLeverageEntity, (e) => e.tradingAccountSchema, { cascade: true })
  @JoinColumn()
  leverageOverwrites: TradingAccountSchemaLeverageEntity[];

  @OneToMany(() => TradingAccountEntity, (e) => e.schema)
  @JoinColumn()
  tradingAccounts: TradingAccountEntity[];

  /** Many-to-many relations */
  @ManyToOne(() => ServerEntity, (e) => e.tradingAccountSchemas, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'serverId' })
  server: ServerEntity;

  @Index()
  @Column({ type: 'uuid' })
  serverId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
