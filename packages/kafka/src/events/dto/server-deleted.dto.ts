export interface ServerDeletedDto {
  /** The id of the server */
  serverId: string;
  /** The timestamp in (UTC millisecond timestamp) */
  deletedAt: number;
}
