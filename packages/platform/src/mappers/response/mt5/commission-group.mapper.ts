import { Injectable } from '@nestjs/common';

import { Mt5Group } from '../../../types/mt5/account/group.type';
import { CommissionGroup } from '../../../models/commission-group';

@Injectable()
export class CommissionGroupMapper {
  toCommissionGroup(data: Mt5Group): CommissionGroup {
    return new CommissionGroup({
      platformGroupId: data.group,
      name: data.group,
      currency: data.currency,
    });
  }

  toCommissionGroups(data: Mt5Group[]): CommissionGroup[] {
    return data.map(this.toCommissionGroup);
  }
}
