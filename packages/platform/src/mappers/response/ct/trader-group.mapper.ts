import { Injectable } from '@nestjs/common';

import { UserGroup } from '../../../models';

import { CtTraderGroup } from '../../../types/ct/account/group.type';

import { ProtoGroup } from '../../../services/ct/manager/proto/base/ts';

@Injectable()
export class TraderGroupMapper {
  toUserGroups(data: CtTraderGroup[] | ProtoGroup[]): UserGroup[] {
    return data.map((d) => this.toUserGroup(d));
  }

  toUserGroup(data: CtTraderGroup | ProtoGroup): UserGroup {
    return 'id' in data
      ? new UserGroup({
          platformGroupId: data.id.toString(),
          name: data.name,
        })
      : new UserGroup({
          platformGroupId: data.groupId.toString(),
          name: data.name ?? '',
        });
  }
}
