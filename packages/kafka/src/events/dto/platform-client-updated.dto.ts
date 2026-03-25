import { Platform, PlatformClientType } from '@crm/types';

export interface PlatformClientUpdatedDto {
  /** The client id */
  clientId: string;
  /** The client type */
  type: PlatformClientType;
  /** The platform the client belongs to */
  platform: Platform;
  /** The link through which users can access the platform or download the client */
  link: string;
  /** Any additional settings associated with the client */
  settings?: Record<string, any>;
  /** The timestamp in (UTC millisecond timestamp) */
  updatedAt: number;
}
