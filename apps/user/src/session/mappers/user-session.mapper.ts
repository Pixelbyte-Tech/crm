import { Injectable } from '@nestjs/common';

import { UserAuthSessionEntity } from '@crm/database';

import { UserSession } from '../domain';

@Injectable()
export class UserSessionMapper {
  toSession(data: UserAuthSessionEntity): UserSession {
    const model = new UserSession();
    model.id = data.id;
    model.hash = data.hash;
    model.ipAddress = data.ipAddress;
    model.userAgent = data.userAgent;
    model.userId = data.userId;
    model.createdAt = data.createdAt;
    model.updatedAt = data.updatedAt;
    return model;
  }
}
