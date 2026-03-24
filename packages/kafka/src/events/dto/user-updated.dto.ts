import { User } from '@crm/types';

export interface UserUpdatedDto {
  /** The user */
  user: User;
  /** The timestamp in (UTC millisecond timestamp) */
  updatedAt: number;
}
