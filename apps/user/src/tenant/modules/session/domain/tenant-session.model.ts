export class TenantSession {
  id: string;
  hash: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(data?: TenantSession) {
    if (data) {
      this.id = data.id;
      this.hash = data.hash;
      this.ipAddress = data.ipAddress;
      this.userAgent = data.userAgent;
      this.tenantId = data.tenantId;
      this.createdAt = data.createdAt;
      this.updatedAt = data.updatedAt;
    }
  }
}
