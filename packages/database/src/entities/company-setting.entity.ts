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

import { CompanySetting } from '@crm/types';

import { CompanyEntity } from './company.entity';

@Entity({ name: 'company_setting' })
@Unique(['companyId', 'key'])
export class CompanySettingEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'enum', enum: CompanySetting })
  key: string;

  @Index()
  @Column({ type: 'text' })
  value: string;

  /** Many-to-one relations */
  @ManyToOne(() => CompanyEntity, (e) => e.settings, {
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
