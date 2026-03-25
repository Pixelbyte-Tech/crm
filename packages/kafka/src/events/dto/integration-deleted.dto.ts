export interface IntegrationDeletedDto {
  /** The id of the integration */
  integrationId: string;
  /** The timestamp in (UTC millisecond timestamp) */
  deletedAt: number;
}
