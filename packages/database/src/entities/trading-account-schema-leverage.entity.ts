import {
  Index,
  Entity,
  Column,
  Unique,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { TradingAccountSchemaEntity } from './trading-account-schema.entity';

@Entity({ name: 'trading_account_schema_leverage' })
@Unique(['tradingAccountSchemaId', 'leverages', 'allowedCountries', 'excludedCountries'])
export class TradingAccountSchemaLeverageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', array: true })
  leverages: number[];

  @Column({ type: 'varchar', length: 3, array: true, nullable: true })
  allowedCountries?: string[] | null;

  @Column({ type: 'varchar', length: 3, array: true, nullable: true })
  excludedCountries?: string[] | null;

  /** Many-to-many relations */
  @ManyToOne(() => TradingAccountSchemaEntity, (e) => e.leverageOverwrites, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tradingAccountSchemaId' })
  tradingAccountSchema: TradingAccountSchemaEntity;

  @Index()
  @Column({ type: 'uuid' })
  tradingAccountSchemaId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
