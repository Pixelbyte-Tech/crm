import {
  Index,
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { TenantEntity } from './tenant.entity';
import { CompanyEntity } from './company.entity';
import { TradingAccountEntity } from './trading-account.entity';

@Entity({ name: 'trading_account_note' })
export class TradingAccountNote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: true })
  summary?: string | null;

  @Column({ type: 'text' })
  body: string;

  @Index()
  @Column({ type: 'boolean', default: false })
  isPinned: boolean;

  /** Many-to-one relations */
  @ManyToOne(() => TenantEntity, (e) => e.tradingAccountNotes, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'authorId' })
  author: TenantEntity;

  @Index()
  @Column({ type: 'text' })
  authorId: string;

  @ManyToOne(() => CompanyEntity, (e) => e.tradingAccountNotes, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'companyId' })
  company: CompanyEntity;

  @Index()
  @Column({ type: 'text' })
  companyId: string;

  @ManyToOne(() => TradingAccountEntity, (e) => e.notes, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tradingAccountId' })
  tradingAccount: TradingAccountEntity;

  @Index()
  @Column({ type: 'text' })
  tradingAccountId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
