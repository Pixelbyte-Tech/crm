import { TenantStatus } from '../enums';

export class Tenant {
  /** Tenant unique identifier */
  id: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  email: string;
  passwordHash: string;
  status: TenantStatus;
  createdAt: Date;
  updatedAt: Date;

  constructor(data?: Tenant) {
    if (data) {
      this.id = data.id;

      this.firstName = data.firstName;
      this.middleName = data.middleName;
      this.lastName = data.lastName;

      this.email = data.email;
      this.passwordHash = data.passwordHash;
      this.status = data.status;

      this.createdAt = data.createdAt;
      this.updatedAt = data.updatedAt;
    }
  }
}
