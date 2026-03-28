import { Platform, Monetisation, TradingAccountStatus } from '@crm/types';

import { Balance } from './balance.model';
import { Tag } from '../modules/tag/domain';
import { UserGroup } from './user-group.model';

export class TradingAccount {
  /** Trading account unique identifier */
  id: string;
  userId: string;
  schemaId?: string;
  serverId: string;
  platformId: string;
  platformUserId?: string;
  platformAccountName?: string;
  friendlyName?: string;
  platform: Platform;
  monetisation: Monetisation;
  status: TradingAccountStatus;
  leverage: number;
  currency: string;
  registeredAt: Date;
  login: string;
  password: string;
  tags: Tag[];
  userGroup?: UserGroup;
  balance?: Balance;

  createdAt: Date;
  updatedAt: Date;

  constructor(data?: TradingAccount) {
    if (data) {
      this.id = data.id;
      this.userId = data.userId;
      this.schemaId = data.schemaId;
      this.serverId = data.serverId;
      this.platformId = data.platformId;
      this.platformUserId = data.platformUserId;
      this.platformAccountName = data.platformAccountName;
      this.friendlyName = data.friendlyName;
      this.platform = data.platform;
      this.monetisation = data.monetisation;
      this.status = data.status;
      this.leverage = data.leverage;
      this.currency = data.currency.toUpperCase();
      this.registeredAt = data.registeredAt;
      this.login = data.login;
      this.password = data.password;
      this.tags = data.tags;
      this.userGroup = data.userGroup;
      this.balance = data.balance;

      this.createdAt = data.createdAt;
      this.updatedAt = data.updatedAt;
    }
  }
}
