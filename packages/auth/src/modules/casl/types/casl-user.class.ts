import { Role } from '@crm/types';

export class CaslUser {
  userId: string;
  roles: {
    [companyId: string]: Role[];
  };
}
