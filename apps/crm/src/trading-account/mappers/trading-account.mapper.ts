import { Injectable } from '@nestjs/common';

import { TradingAccountEntity } from '@crm/database';
import { Balance as PlatformBalance, UserGroup as PlatformUserGroup } from '@crm/platform';

import { TradingAccount } from '../domain';
import { BalanceMapper } from './balance.mapper';
import { TagMapper } from '../modules/tag/mappers';
import { UserGroupMapper } from './user-group.mapper';
@Injectable()
export class TradingAccountMapper {
  constructor(
    private readonly tagMapper: TagMapper,
    private readonly balanceMapper: BalanceMapper,
    private readonly userGroupMapper: UserGroupMapper,
  ) {}
  toTradingAcc(
    data: TradingAccountEntity,
    platformUserGroup?: PlatformUserGroup,
    platformBalance?: PlatformBalance,
  ): TradingAccount {
    const model = new TradingAccount();
    model.id = data.id;
    model.userId = data.userId;
    model.platformId = data.platformId;
    model.platformUserId = data.platformUserId ?? undefined;
    model.platformAccountName = data.platformAccountName ?? undefined;
    model.friendlyName = data.friendlyName ?? undefined;
    model.platform = data.platform;
    model.monetisation = data.monetisation;
    model.status = data.status;
    model.leverage = data.leverage;
    model.currency = data.currency.toUpperCase();
    model.registeredAt = data.registeredAt;
    model.login = data.login;
    model.password = data.password;

    if (platformUserGroup) {
      model.userGroup = this.userGroupMapper.toUserGroup(platformUserGroup);
    }

    if (platformBalance) {
      model.balance = this.balanceMapper.toBalance(platformBalance);
    }

    if (data.tradingAccountTags?.length > 0) {
      model.tags = data.tradingAccountTags.map((tag) => this.tagMapper.toTag(tag.tag));
    }

    model.createdAt = data.createdAt;
    model.updatedAt = data.updatedAt;
    return model;
  }
}
