import { AuditActor, AuditAction, AuditTarget, AuditResult } from '@crm/types';

export class AuditLog {
  /** AuditLog unique identifier */
  id: string;

  // Who performed the action
  actor: AuditActor;

  // What happened
  action: AuditAction;
  target: AuditTarget;
  targetId: string;

  // Outcome
  result: AuditResult;
  failureReason?: string;

  // Request / traceability
  ipAddress?: string;
  userAgent?: string;
  traceId?: string;
  metadata?: Record<string, any>;

  occurredAt: Date;

  user?: AuditLogUser;

  createdAt: Date;
  updatedAt: Date;

  constructor(data?: AuditLog) {
    if (data) {
      this.id = data.id;
      this.actor = data.actor;
      this.action = data.action;
      this.target = data.target;
      this.targetId = data.targetId;
      this.result = data.result;
      this.failureReason = data.failureReason;
      this.ipAddress = data.ipAddress;
      this.userAgent = data.userAgent;
      this.traceId = data.traceId;
      this.metadata = data.metadata;
      this.occurredAt = data.occurredAt;
      this.user = data.user;

      this.createdAt = data.createdAt;
      this.updatedAt = data.updatedAt;
    }
  }
}

class AuditLogUser {
  id: string;
  email: string;
}
