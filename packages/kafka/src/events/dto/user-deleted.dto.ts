export interface UserDeletedDto {
  /** The id of the user */
  userId: string;
  /** The timestamp in (UTC millisecond timestamp) */
  deletedAt: number;
}
