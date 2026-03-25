import { Integration } from '@crm/types';

export interface IntegrationUpdatedDto {
  /** The integration */
  integration: Integration;
  /** The timestamp in (UTC millisecond timestamp) */
  updatedAt: number;
}
