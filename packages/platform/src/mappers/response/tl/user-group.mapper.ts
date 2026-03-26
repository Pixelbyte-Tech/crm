import { Injectable } from '@nestjs/common';

import { UserGroup } from '../../../models/user-group';
import { TlGroup } from '../../../types/tl/account/group.type';

@Injectable()
export class UserGroupMapper {
  toUserGroups(data: TlGroup[]): UserGroup[] {
    return data.map((d) => this.toUserGroup(d));
  }

  toUserGroup(data: TlGroup): UserGroup {
    return new UserGroup({
      platformGroupId: String(data.id),
      name: data.name,
    });
  }
}
