import {
  Index,
  Entity,
  Column,
  Unique,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { IntegrationName, IntegrationType } from '@crm/types';

import { PaymentTransactionEntity } from './payment-transaction.entity';

@Entity({ name: 'integration' })
@Unique(['name'])
export class IntegrationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: IntegrationName })
  name: IntegrationName;

  @Index()
  @Column({ type: 'enum', enum: IntegrationType })
  type: IntegrationType;

  @Column({ type: 'boolean', default: false })
  isEnabled: boolean;

  @Column({ type: 'jsonb' })
  settings: Record<string, any>;

  @Index()
  @Column({ type: 'int', default: 0 })
  priority: number;

  @Column({ type: 'varchar', length: 3, array: true, nullable: true })
  allowedCountries?: string[] | null;

  @Column({ type: 'varchar', length: 3, array: true, nullable: true })
  excludedCountries?: string[] | null;

  /** One-to-many relations */
  @OneToMany(() => PaymentTransactionEntity, (e) => e.integration)
  @JoinColumn()
  paymentTransactions: PaymentTransactionEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
