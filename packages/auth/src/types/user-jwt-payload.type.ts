import { Role } from '@crm/types';

export type UserJwtPayloadType = {
  userId: string;
  sessionId: string;
  roles: Role[];
  iat: number;
  exp: number;
};
