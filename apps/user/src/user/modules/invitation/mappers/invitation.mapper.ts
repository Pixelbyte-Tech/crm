import { Injectable } from '@nestjs/common';

import { CompanyInvitationEntity } from '@crm/database';

import { Invitation } from '../domain';

@Injectable()
export class InvitationMapper {
  toInvitation(data: CompanyInvitationEntity): Invitation {
    const model = new Invitation();
    model.id = data.id;
    model.email = data.email;
    model.token = data.token;
    model.companyId = data.companyId;
    model.roles = data.roles;
    model.status = data.status;
    model.firstSentAt = data.firstSentAt;
    model.lastSentAt = data.lastSentAt;
    model.createdAt = data.createdAt;
    model.updatedAt = data.updatedAt;
    return model;
  }
}
