import {
  Index,
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { AuditActor, AuditAction, AuditTarget, AuditResult } from '@crm/types';

import { UserEntity } from './user.entity';

@Index(['eventId'])
@Entity({ name: 'audit_log' })
export class AuditLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Who performed the action
  @Column({ type: 'enum', enum: AuditActor })
  actor: AuditActor;

  // What happened
  @Index()
  @Column({ type: 'enum', enum: AuditAction })
  targetAction: AuditAction;

  @Index()
  @Column({ type: 'enum', enum: AuditTarget, default: AuditTarget.OTHER })
  targetType: AuditTarget;

  @Index()
  @Column({ type: 'uuid' })
  targetId: string;

  // Outcome
  @Column({ type: 'enum', enum: AuditResult, default: AuditResult.SUCCESS })
  result: AuditResult;

  @Column({ type: 'text', nullable: true })
  failureReason?: string | null;

  // Request / traceability
  @Column({ type: 'inet', nullable: true })
  ipAddress?: string | null;

  @Column({ type: 'text', nullable: true })
  userAgent?: string | null;

  @Column({ type: 'text', nullable: true })
  requestId?: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any> | null;

  @Index()
  @Column({ type: 'timestamp' })
  occurredAt: Date;

  @Column({ type: 'text' })
  eventId: string;

  /** Many-to-many relations */
  @ManyToOne(() => UserEntity, (e) => e.auditLogs, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'userId' })
  user?: UserEntity | null;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  userId?: string | null;

  @PrimaryColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
