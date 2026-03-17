import { Injectable } from '@nestjs/common';

import { Tenant } from '@crm/types';
import { TenantEntity } from '@crm/database';

@Injectable()
export class TenantMapper {
  toTenant(data: TenantEntity): Tenant {
    const tenant = new Tenant();
    tenant.id = data.id;

    tenant.firstName = data.firstName;
    tenant.middleName = data.middleName;
    tenant.lastName = data.lastName;

    tenant.email = data.email;
    tenant.passwordHash = data.passwordHash;
    tenant.status = data.status;

    tenant.createdAt = data.createdAt;
    tenant.updatedAt = data.updatedAt;
    return tenant;
  }
}
