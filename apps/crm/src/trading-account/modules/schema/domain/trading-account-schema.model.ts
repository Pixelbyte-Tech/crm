import { SchemaLeverageOverwrite } from './schema-leverage-overwrite.model';

export class TradingAccountSchema {
  /** Schema unique identifier */
  id: string;
  name: string;
  description?: string;
  isEnabled: boolean;
  isPoiRequired: boolean;
  isPowRequired: boolean;
  allowedLeverages?: number[];
  leverageOverwrites?: SchemaLeverageOverwrite[];
  allowedCurrencies?: string[];
  allowedCountries?: string[];
  excludedCountries?: string[];
  minDepositAmountUsd?: number;
  maxDepositAmountUsd?: number;
  maxAccountsPerUser?: number;
  platformUserGroupId: string;

  createdAt: Date;
  updatedAt: Date;

  constructor(data?: TradingAccountSchema) {
    if (data) {
      this.id = data.id;
      this.name = data.name;
      this.description = data.description;
      this.isEnabled = data.isEnabled;
      this.isPoiRequired = data.isPoiRequired;
      this.isPowRequired = data.isPowRequired;
      this.allowedLeverages = data.allowedLeverages;
      this.leverageOverwrites = data.leverageOverwrites;
      this.allowedCurrencies = data.allowedCurrencies;
      this.allowedCountries = data.allowedCountries;
      this.excludedCountries = data.excludedCountries;
      this.minDepositAmountUsd = data.minDepositAmountUsd;
      this.maxDepositAmountUsd = data.maxDepositAmountUsd;
      this.maxAccountsPerUser = data.maxAccountsPerUser;
      this.platformUserGroupId = data.platformUserGroupId;

      this.createdAt = data.createdAt;
      this.updatedAt = data.updatedAt;
    }
  }
}
