export type DatabaseConfig = {
  host?: string;
  port?: number;
  password?: string;
  username?: string;
  name?: string;
  maxConnections: number;
  sslEnabled?: boolean;
  rejectUnauthorized?: boolean;
  ca?: string;
  key?: string;
  cert?: string;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
  maxUses?: number;
};
