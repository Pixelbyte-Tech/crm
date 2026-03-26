import { Injectable } from '@nestjs/common';

import { UserGroup } from '../../../models/user-group';
import { Mt5Group } from '../../../types/mt5/account/group.type';

@Injectable()
export class UserGroupMapper {
  toUserGroups(data: Mt5Group[]): UserGroup[] {
    return data.map((d) => this.toUserGroup(d));
  }

  toUserGroup(data: Mt5Group): UserGroup {
    return new UserGroup({
      platformGroupId: data.group,
      name: data.group,
      currency: data.currency,
    });
  }
}
