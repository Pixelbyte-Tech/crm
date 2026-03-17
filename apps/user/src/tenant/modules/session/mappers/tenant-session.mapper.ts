import { Injectable } from '@nestjs/common';

import { TenantAuthSessionEntity } from '@crm/database';

import { TenantSession } from '../domain';

@Injectable()
export class TenantSessionMapper {
  toSession(data: TenantAuthSessionEntity): TenantSession {
    const model = new TenantSession();
    model.id = data.id;
    model.hash = data.hash;
    model.ipAddress = data.ipAddress;
    model.userAgent = data.userAgent;
    model.tenantId = data.tenantId;
    model.createdAt = data.createdAt;
    model.updatedAt = data.updatedAt;
    return model;
  }
}
