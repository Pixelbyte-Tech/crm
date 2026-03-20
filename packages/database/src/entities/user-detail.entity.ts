import {
  Index,
  Entity,
  Column,
  OneToOne,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { UserExperience, UserEmploymentStatus } from '@crm/types';

import { UserEntity } from './user.entity';
import { CompanyEntity } from './company.entity';

@Entity({ name: 'user_detail' })
export class UserDetailEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date', nullable: true })
  birthday?: Date | null;

  @Column({ type: 'text', nullable: true })
  phone?: string | null;

  @Column({ type: 'text', nullable: true })
  addressLine1?: string | null;

  @Column({ type: 'text', nullable: true })
  addressLine2?: string | null;

  @Column({ type: 'text', nullable: true })
  city?: string | null;

  @Column({ type: 'text', nullable: true })
  postcode?: string | null;

  @Column({ type: 'text', nullable: true })
  state?: string | null;

  @Index()
  @Column({ type: 'varchar', length: 3, nullable: true })
  country?: string | null;

  @Column({ type: 'text', nullable: true })
  taxId?: string | null;

  @Index()
  @Column({ type: 'boolean', default: false })
  isPoaVerified: boolean;

  @Index()
  @Column({ type: 'boolean', default: false })
  isPoiVerified: boolean;

  @Index()
  @Column({ type: 'boolean', default: false })
  isPowVerified: boolean;

  @Index()
  @Column({ type: 'boolean', default: false })
  isPoliticallyExposed: boolean;

  @Column({ type: 'float', nullable: true })
  netCapitalUsd?: number | null;

  @Column({ type: 'float', nullable: true })
  annualIncomeUsd?: number | null;

  @Column({ type: 'float', nullable: true })
  approxAnnualInvestmentVolumeUsd?: number | null;

  @Column({ type: 'text', nullable: true })
  occupation?: string | null;

  @Column({ type: 'enum', enum: UserEmploymentStatus, nullable: true })
  employmentStatus?: UserEmploymentStatus | null;

  @Column({ type: 'text', nullable: true })
  sourceOfFunds?: string | null;

  @Column({ type: 'enum', enum: UserExperience, array: true, nullable: true })
  experience?: UserExperience[] | null;

  /** One-to-one relations */
  @OneToOne(() => UserEntity, (e) => e.detail)
  user: UserEntity;

  /** Many-to-one relations */
  @ManyToOne(() => CompanyEntity, (e) => e.userDetails, {
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
