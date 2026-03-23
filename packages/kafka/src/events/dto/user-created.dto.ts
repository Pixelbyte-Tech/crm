import { User } from '@crm/types';

export interface UserCreatedDto {
  /** The user */
  user: User;
  /** The token the user needs to use in order to confirm their email */
  confirmEmailToken: string;
  /** The timestamp in (UTC millisecond timestamp) */
  createdAt: number;
}
