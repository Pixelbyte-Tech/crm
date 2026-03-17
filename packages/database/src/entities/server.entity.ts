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

import { Platform, Monetization } from '@crm/types';

import { CompanyEntity } from './company.entity';
import { TradingAccountEntity } from './trading-account.entity';
import { TradingAccountTypeEntity } from './trading-account-type.entity';

@Entity({ name: 'server' })
@Unique(['name'])
export class ServerEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  name: string;

  @Index()
  @Column({ type: 'enum', enum: Platform })
  platform: Platform;

  @Index()
  @Column({ type: 'enum', enum: Monetization })
  monetization: Monetization;

  @Column({ type: 'boolean', default: false })
  isEnabled: boolean;

  @Column({ type: 'jsonb' })
  settings: Record<string, any>;

  /** One-to-many relations */
  @OneToMany(() => TradingAccountEntity, (e) => e.server)
  @JoinColumn()
  tradingAccounts: TradingAccountEntity[];

  @OneToMany(() => TradingAccountTypeEntity, (e) => e.server)
  @JoinColumn()
  tradingAccountTypes: TradingAccountTypeEntity[];

  /** Many-to-one relations */
  @ManyToOne(() => CompanyEntity, (e) => e.servers, {
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
