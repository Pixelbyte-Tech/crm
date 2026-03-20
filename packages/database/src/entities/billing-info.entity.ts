import { Entity, Column, OneToOne, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

import { CompanyEntity } from './company.entity';

@Entity({ name: 'billing_info' })
export class BillingInfoEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text' })
  addressLine1: string;

  @Column({ type: 'text', nullable: true })
  addressLine2?: string | null;

  @Column({ type: 'text' })
  city: string;

  @Column({ type: 'text' })
  postcode: string;

  @Column({ type: 'text', nullable: true })
  state?: string | null;

  @Column({ type: 'varchar', length: 3 })
  country: string;

  @Column({ type: 'text', nullable: true })
  taxId?: string | null;

  /** One-to-one relations */
  @OneToOne(() => CompanyEntity, (e) => e.billingInfo)
  company: CompanyEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
