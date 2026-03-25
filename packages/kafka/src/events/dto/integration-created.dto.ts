import { Integration } from '@crm/types';

export interface IntegrationCreatedDto {
  /** The integration */
  integration: Integration;
  /** The timestamp in (UTC millisecond timestamp) */
  createdAt: number;
}
