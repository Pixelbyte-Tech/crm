import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'payment_promo_code' })
export class PaymentPromoCodeEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  code: string;

  @Column({ type: 'smallint' })
  amount: number;

  @Column({ type: 'boolean', default: true })
  isPercentage: boolean;

  @Column({ type: 'boolean', default: false })
  isEnabled: boolean;

  @Column({ type: 'timestamp', nullable: true })
  validFrom?: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  validTo?: Date | null;

  @Column({ type: 'smallint', nullable: true })
  maxUsesTotal?: number | null;

  @Column({ type: 'smallint', nullable: true, default: 1 })
  maxUsesPerUser?: number | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
