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

import { PaymentTransactionType, PaymentTransactionStatus } from '@crm/types';

import { UserEntity } from './user.entity';
import { CompanyEntity } from './company.entity';
import { IntegrationEntity } from './integration.entity';

@Entity({ name: 'payment_transaction' })
@Unique(['externalId', 'integrationId'])
export class PaymentTransactionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: true })
  externalId?: string | null;

  @Column({ type: 'decimal' })
  amount: number;

  @Column({ type: 'decimal' })
  paidAmount: number;

  @Column({ type: 'varchar', length: 3 })
  currency: string;

  @Column({ type: 'enum', enum: PaymentTransactionType })
  type: PaymentTransactionType;

  @Column({ type: 'enum', enum: PaymentTransactionStatus })
  status: PaymentTransactionStatus;

  @Column({ type: 'text', nullable: true })
  comment?: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any> | null;

  @Column({ type: 'timestamp', nullable: true })
  processedAt: Date | null;

  /** Many-to-one relations */
  @ManyToOne(() => CompanyEntity, (e) => e.paymentTransactions, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'companyId' })
  company: CompanyEntity;

  @Index()
  @Column({ type: 'text' })
  companyId: string;

  @ManyToOne(() => UserEntity, (e) => e.paymentTransactions, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Index()
  @Column({ type: 'text' })
  userId: string;

  @ManyToOne(() => IntegrationEntity, (e) => e.paymentTransactions, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'integrationId' })
  integration: IntegrationEntity;

  @Index()
  @Column({ type: 'text' })
  integrationId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
