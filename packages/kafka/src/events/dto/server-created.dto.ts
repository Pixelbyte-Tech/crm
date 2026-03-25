import { Platform, Monetisation } from '@crm/types';

export interface ServerCreatedDto {
  /** The server id */
  serverId: string;
  /** A friendly name to apply to the server */
  name: string;
  /** The platform the server belongs to */
  platform: Platform;
  /** The monetisation of the server */
  monetisation: Monetisation;
  /** Whether the server should be automatically enabled */
  isEnabled: boolean;
  /** The settings for the server */
  settings: Record<string, any>;
  /** The server timezone */
  timezone: string;
  /** Any offset hours from the timezone of the server */
  offsetHours: number;
  /** The integration this server belongs to */
  integrationId: string;
  /** The timestamp in (UTC millisecond timestamp) */
  createdAt: number;
}
