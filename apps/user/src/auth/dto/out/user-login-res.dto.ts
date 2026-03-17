import { User } from '@crm/types';

export class UserLoginResDto {
  /** The authentication and refresh tokens */
  tokens: {
    auth: { token: string; expireMs: number };
    refresh: { token: string; expireMs: number };
  };

  /** The logged-in user */
  user: User;
}
