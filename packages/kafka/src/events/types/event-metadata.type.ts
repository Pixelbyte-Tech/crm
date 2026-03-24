import { Role, AuditActor } from '@crm/types';

export type EventMetadata = {
  actor?:
    | {
        userId?: string;
        sessionId?: string;
        roles?: Role[];
        userAgent?: string;
        ipAddress?: string;
        traceId?: string;
      }
    | AuditActor.SYSTEM;
};
