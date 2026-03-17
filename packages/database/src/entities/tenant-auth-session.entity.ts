import {
  Index,
  Entity,
  Column,
  Unique,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { TenantEntity } from './tenant.entity';

@Unique(['tenantId', 'createdAt'])
@Entity({ name: 'tenant_auth_session' })
export class TenantAuthSessionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  hash: string;

  @Index()
  @Column({ type: 'text', nullable: true })
  ipAddress?: string | null;

  @Column({ type: 'text', nullable: true })
  userAgent?: string | null;

  /** Many-to-one relations */
  @ManyToOne(() => TenantEntity, (e) => e.authSessions, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tenantId' })
  tenant: TenantEntity;

  @Index()
  @Column({ type: 'text' })
  tenantId: string;

  @PrimaryColumn({ default: new Date() })
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
