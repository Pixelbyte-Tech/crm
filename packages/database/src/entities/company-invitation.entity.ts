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

import { Role, InvitationStatus } from '@crm/types';

import { CompanyEntity } from './company.entity';

@Entity({ name: 'company_invitation' })
@Unique(['email', 'companyId', 'status'])
export class CompanyInvitationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  email: string;

  @Column({ type: 'enum', enum: InvitationStatus })
  status: InvitationStatus;

  @Column({ type: 'text' })
  token: string;

  @Column({ type: 'enum', enum: Role, array: true })
  roles: Role[];

  @Column({ type: 'timestamp', nullable: true })
  firstSentAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  lastSentAt?: Date | null;

  @Column({ type: 'integer', default: 30 })
  expiresInDays: number;

  @ManyToOne(() => CompanyEntity, (e) => e.invitations, {
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
