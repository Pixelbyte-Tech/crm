import Long from 'long';
import { Injectable } from '@nestjs/common';

import { Cryptography } from '@crm/utils';

import { CtManagerApiService } from '../../../services/ct/manager/ct-manager-api.service';

import { CreateAccountDto, CtAdditionalCreateAccountData } from '../../../dto/create-account.dto';
import { UpdateAccountDto, CtAdditionalUpdateAccountData } from '../../../dto/update-account.dto';

import { CountryReqMapper } from './country-req.mapper';
import { UnknownCurrencyException } from '../../../exceptions';
import { CtMapperHelper } from '../../helper/ct-mapper.helper';
import {
  ProtoTrader,
  ProtoAccountType,
  ProtoAccessRights,
  ProtoCSPayloadType,
  ProtoTraderByIdRes,
  ProtoTotalMarginCalculationType,
  ProtoLimitedRiskMarginCalculationStrategy,
} from '../../../services/ct/manager/proto/base/ts';

@Injectable()
export class TraderReqMapper {
  constructor(
    private readonly helper: CtMapperHelper,
    private readonly countryReqMapper: CountryReqMapper,
  ) {}

  async toLoginByTraderId(managerApi: CtManagerApiService, traderId: string): Promise<string | null> {
    return await this.helper.protoTraderIdToLogin(managerApi, traderId);
  }

  /**
   * Finds an existing proto trader by id from the ManagerAPI
   * @param managerApi The ManagerAPI service
   * @param traderId The trader id to look up
   */
  async toProtoTraderById(managerApi: CtManagerApiService, traderId: string): Promise<ProtoTrader> {
    const { trader } = await managerApi.sendMessage<ProtoTraderByIdRes>(
      ProtoCSPayloadType.PROTO_TRADER_BY_ID_REQ,
      'ProtoTraderByIdReq',
      'ProtoTraderByIdRes',
      { traderId: [Long.fromString(traderId)] },
    );

    return trader[0];
  }

  /**
   * Creates a ManagerAPI ProtoTrader object
   * @param managerApi The ManagerAPI service
   * @param dto The details to create the trader with
   * @param brokerName The name of the broker to create the trader under
   * @param groupId The group id to create the trader under
   * @throws UnknownCurrencyException If the currency is not found
   */
  async toProtoTrader(
    managerApi: CtManagerApiService,
    dto: CreateAccountDto<CtAdditionalCreateAccountData>,
    brokerName: string,
    groupId: string | number,
  ): Promise<ProtoTrader> {
    // Get the asset id map for the currency
    const map = await this.helper.getAssetIdMap(managerApi, dto.currency);
    const depositAssetId = map.get(dto.currency.toUpperCase());
    if (!depositAssetId) {
      throw new UnknownCurrencyException(dto.currency);
    }

    return {
      traderId: Long.fromValue(0),
      login: Long.fromValue(0),
      groupId: Long.fromValue(Number(groupId)),
      balance: Long.fromValue(0),
      brokerName: brokerName,
      leverageInCents: dto.leverage * 100,
      accountType: ProtoAccountType.HEDGED,
      accessRights: ProtoAccessRights.FULL_ACCESS,
      depositAssetId: Long.fromString(depositAssetId),
      rank: [],
      hasRank: false,
      name: dto.firstName,
      lastName: dto.lastName,
      description: dto.comment,
      email: dto.email,
      passwordHash: Cryptography.hashMd5(dto.password),
      address: dto.address,
      city: dto.city,
      state: dto.state,
      zipCode: dto.zipcode,
      countryId: dto.country ? Long.fromValue(this.countryReqMapper.toCountryId(dto.country)) : undefined,
      phone: dto.phone,
      sendOwnStatement: false,
      totalMarginCalculationType: ProtoTotalMarginCalculationType.NET,
      ibCommissionSymbolCategory: [],
      defaultIbCommissionSymbolCategory: [],
      isLimitedRisk: false,
      limitedRiskMarginCalculationStrategy: ProtoLimitedRiskMarginCalculationStrategy.ACCORDING_TO_LEVERAGE,
    };
  }

  toProtoTraderUpdate(trader: ProtoTrader, dto: UpdateAccountDto<CtAdditionalUpdateAccountData>): ProtoTrader {
    // Personal details
    if (dto.firstName) {
      trader.name = dto.firstName;
    }
    if (dto.lastName) {
      trader.lastName = dto.lastName;
    }

    // Access rights
    if ('isTradingAllowed' in dto) {
      trader.accessRights = !dto.isTradingAllowed
        ? ProtoAccessRights.NO_TRADING
        : 'isSuspended' in dto && dto.isSuspended
          ? ProtoAccessRights.NO_LOGIN
          : ProtoAccessRights.FULL_ACCESS;
    }

    if ('isSuspended' in dto) {
      trader.accessRights = dto.isSuspended
        ? ProtoAccessRights.NO_LOGIN
        : 'isTradingAllowed' in dto && !dto.isTradingAllowed
          ? ProtoAccessRights.NO_TRADING
          : ProtoAccessRights.FULL_ACCESS;
    }

    // Leverage
    if (dto.leverage) {
      trader.leverageInCents = dto.leverage * 100;
    }

    // Contact details
    if (dto.email) {
      trader.email = dto.email;
    }
    if (dto.phone) {
      trader.phone = dto.phone;
    }

    // Address
    if (dto.address) {
      trader.address = dto.address;
    }
    if (dto.city) {
      trader.city = dto.city;
    }
    if (dto.zipcode) {
      trader.zipCode = dto.zipcode;
    }
    if (dto.state) {
      trader.state = dto.state;
    }
    if (dto.country) {
      trader.countryId = Long.fromValue(this.countryReqMapper.toCountryId(dto.country));
    }

    return trader;
  }
}
