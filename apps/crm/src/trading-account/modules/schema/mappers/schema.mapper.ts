import { Injectable } from '@nestjs/common';

import { TradingAccountSchemaEntity } from '@crm/database';

import { TradingAccountSchema } from '../domain';

@Injectable()
export class SchemaMapper {
  toSchema(data: TradingAccountSchemaEntity): TradingAccountSchema {
    const model = new TradingAccountSchema();
    model.id = data.id;
    model.name = data.name;
    model.description = data.description ?? undefined;
    model.isEnabled = data.isEnabled;
    model.isKycRequired = data.isKycRequired;
    model.allowedLeverages = data.allowedLeverages ?? undefined;
    model.leverageOverwrites =
      data.leverageOverwrites?.map((o) => ({
        id: o.id,
        leverages: o.leverages,
        allowedCountries: o.allowedCountries ?? undefined,
        excludedCountries: o.excludedCountries ?? undefined,
        createdAt: o.createdAt,
        updatedAt: o.updatedAt,
      })) ?? undefined;
    model.allowedCurrencies = data.allowedCurrencies ?? undefined;
    model.allowedCountries = data.allowedCountries ?? undefined;
    model.excludedCountries = data.excludedCountries ?? undefined;
    model.minDepositAmountUsd = data.minDepositAmountUsd ?? undefined;
    model.maxDepositAmountUsd = data.maxDepositAmountUsd ?? undefined;
    model.maxAccountsPerUser = data.maxAccountsPerUser ?? undefined;
    model.platformUserGroupId = data.platformUserGroupId;

    model.createdAt = data.createdAt;
    model.updatedAt = data.updatedAt;
    return model;
  }
}
