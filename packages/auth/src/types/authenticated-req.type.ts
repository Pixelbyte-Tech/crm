import { Request } from 'express';

import { Role } from '@crm/types';

export interface AuthenticatedReq extends Request {
  user: {
    userId: string;
    sessionId: string;
    roles: {
      [companyId: string]: Role[];
    };
  };
}
