export class UserSession {
  id: string;
  hash: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(data?: UserSession) {
    if (data) {
      this.id = data.id;
      this.hash = data.hash;
      this.ipAddress = data.ipAddress;
      this.userAgent = data.userAgent;
      this.userId = data.userId;
      this.createdAt = data.createdAt;
      this.updatedAt = data.updatedAt;
    }
  }
}
