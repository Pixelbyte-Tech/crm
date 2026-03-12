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

import { TenantStatus } from '@crm/types';

import { AuditLogEntity } from './audit-log.entity';
import { UserNoteEntity } from './user-note.entity';
import { OrganisationEntity } from './organisation.entity';
import { TenantCompanyEntity } from './tenant-company.entity';
import { TradingAccountNote } from './trading-account-note.entity';
import { TenantAuthSessionEntity } from './tenant-auth-session.entity';
import { TradingAccountTagEntity } from './trading-account-tag.entity';

@Entity({ name: 'tenant' })
@Unique(['organisationId', 'email'])
export class TenantEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  firstName: string;

  @Column({ type: 'text', nullable: true })
  middleName?: string | null;

  @Column({ type: 'text' })
  lastName: string;

  @Index()
  @Column({ type: 'text' })
  email: string;

  @Column({ type: 'text' })
  passwordHash: string;

  @Index()
  @Column({ type: 'enum', enum: TenantStatus })
  status: TenantStatus;

  /** One-to-many relations */
  @OneToMany(() => AuditLogEntity, (e) => e.tenant)
  @JoinColumn()
  auditLogs: AuditLogEntity[];

  @OneToMany(() => TenantAuthSessionEntity, (e) => e.tenant)
  @JoinColumn()
  authSessions: TenantAuthSessionEntity[];

  @OneToMany(() => TenantCompanyEntity, (e) => e.tenant)
  @JoinColumn()
  tenantCompanies: TenantCompanyEntity[];

  @OneToMany(() => TradingAccountNote, (e) => e.author)
  @JoinColumn()
  tradingAccountNotes: TradingAccountNote[];

  @OneToMany(() => TradingAccountTagEntity, (e) => e.taggedByTenant)
  @JoinColumn()
  tradingAccountTags: TradingAccountTagEntity[];

  @OneToMany(() => UserNoteEntity, (e) => e.author)
  @JoinColumn()
  userNotes: UserNoteEntity[];

  /** Many-to-one relations */
  @ManyToOne(() => OrganisationEntity, (e) => e.tenants, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'organisationId' })
  organisation: OrganisationEntity;

  @Index()
  @Column({ type: 'text' })
  organisationId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
