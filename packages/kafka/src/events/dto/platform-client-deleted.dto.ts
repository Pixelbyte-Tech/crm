export interface PlatformClientDeletedDto {
  /** The id of the platform client */
  clientId: string;
  /** The timestamp in (UTC millisecond timestamp) */
  deletedAt: number;
}
