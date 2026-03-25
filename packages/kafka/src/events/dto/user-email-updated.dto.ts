export interface UserEmailUpdatedDto {
  /** The user id */
  id: string;
  /** The old email address */
  oldEmail: string;
  /** The new email address */
  newEmail: string;
  /** The timestamp in (UTC millisecond timestamp) */
  updatedAt: number;
}
