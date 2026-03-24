import { Request } from 'express';

import { AuditActor } from '@crm/types';
import { AuthenticatedReq } from '@crm/auth';

import { EventMetadata } from '../events/types';

export function toEventMetadata(): EventMetadata;
export function toEventMetadata(req?: undefined): EventMetadata;
export function toEventMetadata(req: Request): EventMetadata;
export function toEventMetadata(req: AuthenticatedReq): EventMetadata;

/**
 * Converts a request to event meta data
 * @param req The request object
 */
export function toEventMetadata(req?: Request | AuthenticatedReq | null): EventMetadata {
  // If no request, return SYSTEM actor
  if (!req) {
    return { actor: AuditActor.SYSTEM };
  }

  // Check if this is an authenticated request
  if ('user' in req && req.user) {
    const authReq = req as AuthenticatedReq;
    return {
      actor: {
        userId: authReq.user.userId,
        sessionId: authReq.user.sessionId,
        roles: authReq.user.roles,
        userAgent: authReq.user.userAgent,
        ipAddress: authReq.user.ipAddress,
        traceId: authReq.user.traceId,
      },
    };
  }

  // Otherwise, return the user agent and IP address if available
  return {
    actor: {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    },
  };
}
