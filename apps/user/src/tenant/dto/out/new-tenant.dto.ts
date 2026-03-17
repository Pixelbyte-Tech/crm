import { Tenant } from '@crm/types';

export class NewTenantDto {
  /** The new tenant */
  tenant: Tenant;

  /** The token to use for confirming the email */
  tokens: {
    confirmEmail: { token: string; expireMs: number };
  };
}
