import { Injectable } from '@nestjs/common';

import { UserGroup as PlatformUserGroup } from '@crm/platform';

import { UserGroup } from '../domain';

@Injectable()
export class UserGroupMapper {
  toUserGroup(data: PlatformUserGroup): UserGroup {
    const model = new UserGroup();
    model.platformId = data.platformGroupId;
    model.platformName = data.name ?? undefined;
    model.currency = data.currency?.toUpperCase() ?? undefined;

    return model;
  }
}
