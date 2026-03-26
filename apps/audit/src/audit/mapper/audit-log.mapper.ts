import { Injectable } from '@nestjs/common';

import { AuditLogEntity } from '@crm/database';

import { AuditLog } from '../domain';

@Injectable()
export class AuditLogMapper {
  toAuditLog(data: AuditLogEntity): AuditLog {
    const model = new AuditLog();
    model.id = data.id;
    model.actor = data.actor;
    model.target = data.targetType;
    model.targetId = data.targetId;

    model.result = data.result;
    model.failureReason = data.failureReason ?? undefined;

    model.ipAddress = data.ipAddress ?? undefined;
    model.userAgent = data.userAgent ?? undefined;
    model.traceId = data.failureReason ?? undefined;
    model.metadata = data.metadata ?? undefined;

    model.occurredAt = data.occurredAt;
    model.user = data.user ? { id: data.user.id, email: data.user.email } : undefined;

    model.createdAt = data.createdAt;
    model.updatedAt = data.updatedAt;
    return model;
  }
}
