import { Role, InvitationStatus } from '@crm/types';

export class Invitation {
  /** Invitation unique identifier */
  id: string;
  email: string;
  token: string;
  companyId: string;
  status: InvitationStatus;
  roles: Role[];
  firstSentAt?: Date | null;
  lastSentAt?: Date | null;
  expiresInDays: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(data?: Invitation) {
    if (data) {
      this.id = data.id;
      this.email = data.email;
      this.token = data.token;
      this.companyId = data.companyId;
      this.status = data.status;
      this.roles = data.roles;
      this.firstSentAt = data.firstSentAt;
      this.lastSentAt = data.lastSentAt;
      this.expiresInDays = data.expiresInDays;
      this.createdAt = data.createdAt;
      this.updatedAt = data.updatedAt;
    }
  }
}
