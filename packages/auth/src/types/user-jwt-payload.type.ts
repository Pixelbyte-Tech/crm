import { Role } from '@crm/types';

export type UserJwtPayloadType = {
  userId: string;
  sessionId: string;
  roles: {
    [companyId: string]: Role[];
  };
  iat: number;
  exp: number;
};
