import Long from 'long';
import Redis from 'ioredis';
import { forEach } from 'lodash';
import { Inject, Logger, Injectable } from '@nestjs/common';

import { Serializer } from '../../services/serializer.service';
import { CtManagerApiService } from '../../services/ct/manager/ct-manager-api.service';

import { BaseMapperHelper } from './base-mapper.helper';
import {
  ProtoAsset,
  ProtoHoliday,
  ProtoAssetClass,
  ProtoAssetListRes,
  ProtoCSPayloadType,
  ProtoVolumeProfile,
  ProtoTraderByIdRes,
  ProtoSymbolCategory,
  ProtoHolidayListRes,
  ProtoHolidayProfile,
  ProtoScheduleProfile,
  ProtoAssetClassListRes,
  ProtoVolumeProfileListRes,
  ProtoManagerSymbolListRes,
  ProtoSymbolCategoryListRes,
  ProtoHolidayProfileListRes,
  ProtoScheduleProfileListRes,
} from '../../services/ct/manager/proto/base/ts';

type SymbolPartial = { name: string; digits: number; lotSize?: string };

@Injectable()
export class CtMapperHelper extends BaseMapperHelper {
  public constructor(
    protected readonly serializer: Serializer,
    @Inject('REDIS') protected readonly redis: Redis,
  ) {
    super(serializer, redis, 'ct');
  }

  /** The logger for the class */
  readonly #logger = new Logger(this.constructor.name);

  /**
   * Converts a proto trader id to a login
   * @param managerApi The manager API client linked to the platform
   * @param traderId The id of the trader to get the login for
   */
  async protoTraderIdToLogin(managerApi: CtManagerApiService, traderId: string): Promise<string | null> {
    const KEY = this.cacheKey('logins', managerApi);

    // Get the cached data we have
    const getCached = async () => {
      return this.redis.hget(KEY, traderId);
    };

    // If the cache has the element we want, return that element
    const login = await getCached();
    if (login) {
      return login;
    }

    return await this.debounceReq<string | null>(
      async () => {
        try {
          // Fetch the data from the platform
          const { trader } = await managerApi.sendMessage<ProtoTraderByIdRes>(
            ProtoCSPayloadType.PROTO_TRADER_BY_ID_REQ,
            'ProtoTraderByIdReq',
            'ProtoTraderByIdRes',
            { traderId: [Long.fromString(traderId)] },
          );

          // Get the login
          const login = trader.length ? trader[0].login.toString() : null;

          // Store the data in the cache
          if (login) {
            await this.redis.hset(KEY, traderId, login);
          }

          return login;
        } catch (err) {
          this.#logger.error('Failed to retrieve Trader from CT', err);
          return null;
        }
      },
      getCached.bind(this),
      KEY,
    );
  }

  /**
   * Returns a map of symbol names to symbol ids
   * @param managerApi The manager API client linked to the platform
   * @param symbol The name of the symbol to get the data for
   */
  async getSymbolIdsMap(managerApi: CtManagerApiService, symbol: string): Promise<Map<string, string>> {
    const KEY = this.cacheKey('symbols:id', managerApi);

    // Get the cached data we have
    const getCached = async () => {
      const symbolMap = new Map<string, string>();
      const obj = (await this.redis.hgetall(KEY)) ?? {};
      for (const [key, value] of Object.entries(obj)) {
        if (value) symbolMap.set(key, value);
      }
      return symbolMap;
    };

    // If the cache has the element we want, return the map
    const map = await getCached();
    if (map.has(symbol)) {
      return map;
    }

    const data = await this.debounceReq<Map<string, string>>(
      async () => {
        try {
          // Fetch the data from the platform
          const symbolData = await managerApi.sendMessage<ProtoManagerSymbolListRes>(
            ProtoCSPayloadType.PROTO_MANAGER_SYMBOL_LIST_REQ,
            'ProtoManagerSymbolListReq',
            'ProtoManagerSymbolListRes',
          );

          // Prepare the map with data
          forEach(symbolData.symbol || [], (s) => {
            map.set(s.name, s.symbolId.toString());
            void this.redis.hset(KEY, s.name, s.symbolId.toString());
          });

          return map;
        } catch (err) {
          this.#logger.error('Failed to retrieve Symbols from CT', err);
          return new Map();
        }
      },
      getCached.bind(this),
      KEY,
    );

    return data ?? new Map();
  }

  /**
   * Returns a map of symbol ids to partial symbol data
   * @param managerApi The manager API client linked to the platform
   * @param symbolId The id of the symbol to get the data for
   */
  async getSymbolMap(managerApi: CtManagerApiService, symbolId: string): Promise<Map<string, SymbolPartial>> {
    const KEY = this.cacheKey('symbols:symbol', managerApi);

    // Get the cached data we have
    const getCached = async () => {
      const symbolMap = new Map<string, SymbolPartial>();
      const obj = (await this.redis.hgetall(KEY)) ?? {};
      for (const [key, value] of Object.entries(obj)) {
        const val = this.serializer.unSerialize(value);
        if (val) symbolMap.set(key, val);
      }
      return symbolMap;
    };

    // If the cache has the element we want, return the map
    const map = await getCached();
    if (map.has(symbolId)) {
      return map;
    }

    const data = await this.debounceReq<Map<string, SymbolPartial>>(
      async () => {
        try {
          // Fetch the data from the platform
          const symbolData = await managerApi.sendMessage<ProtoManagerSymbolListRes>(
            ProtoCSPayloadType.PROTO_MANAGER_SYMBOL_LIST_REQ,
            'ProtoManagerSymbolListReq',
            'ProtoManagerSymbolListRes',
          );

          // Prepare the map with data
          forEach(symbolData.symbol || [], (s) => {
            const partial = { name: s.name, digits: s.digits, lotSize: s.lotSize?.toString() };
            map.set(s.symbolId.toString(), partial);

            const val = this.serializer.serialize(partial);
            if (val) void this.redis.hset(KEY, s.symbolId.toString(), val);
          });

          return map;
        } catch (err) {
          this.#logger.error('Failed to retrieve Symbols from CT', err);
          return new Map();
        }
      },
      getCached.bind(this),
      KEY,
    );

    return data ?? new Map();
  }

  /**
   * Returns a map of Volume Profiles to their respective Profile id
   * @param managerApi The manager API client linked to the platform
   * @param volumeProfileId The id of the volume profile to get the data for
   */
  async getVolumeProfileMap(
    managerApi: CtManagerApiService,
    volumeProfileId: string,
  ): Promise<Map<string, ProtoVolumeProfile>> {
    const KEY = this.cacheKey('volume_profiles', managerApi);

    // Get the cached data we have
    const getCached = async () => {
      const volumeProfileMap = new Map<string, ProtoVolumeProfile>();
      const obj = (await this.redis.hgetall(KEY)) ?? {};
      for (const [key, value] of Object.entries(obj)) {
        const val = this.serializer.unSerialize(value);
        if (val) volumeProfileMap.set(key, val);
      }
      return volumeProfileMap;
    };

    // If the cache has the element we want, return the map
    const map = await getCached();
    if (map.has(volumeProfileId)) {
      return map;
    }

    const data = await this.debounceReq<Map<string, ProtoVolumeProfile>>(
      async () => {
        try {
          // Fetch the data from the platform
          const volumeData = await managerApi.sendMessage<ProtoVolumeProfileListRes>(
            ProtoCSPayloadType.PROTO_VOLUME_PROFILE_LIST_REQ,
            'ProtoVolumeProfileListReq',
            'ProtoVolumeProfileListRes',
          );

          // Prepare the map with data
          forEach(volumeData.volumeProfile || [], async (volumeProfile) => {
            map.set(volumeProfile.volumeProfileId.toString(), volumeProfile);

            const val = this.serializer.serialize(volumeProfile);
            if (val) await this.redis.hset(KEY, volumeProfileId.toString(), val);
          });

          return map;
        } catch (err) {
          this.#logger.error('Failed to retrieve Volume Profiles from CT', err);
          return new Map();
        }
      },
      getCached.bind(this),
      KEY,
    );

    return data ?? new Map();
  }

  /**
   * Returns a map of currency ISOs to their respective Asset id
   * @param managerApi The manager API client linked to the platform
   * @param currency The currency to get the asset id for
   */
  async getAssetIdMap(managerApi: CtManagerApiService, currency: string): Promise<Map<string, string>> {
    const KEY = this.cacheKey('asset_ids', managerApi);

    // Get the cached data we have
    const getCached = async () => {
      const assetIdMap = new Map<string, string>();
      const obj = (await this.redis.hgetall(KEY)) ?? {};
      for (const [key, value] of Object.entries(obj)) {
        if (value) assetIdMap.set(key, value);
      }
      return assetIdMap;
    };

    // If the cache has the element we want, return the map
    const map = await getCached();
    if (map.has(currency)) {
      return map;
    }

    const data = await this.debounceReq<Map<string, string>>(
      async () => {
        try {
          // Fetch the data from the platform
          const assetData = await managerApi.sendMessage<ProtoAssetListRes>(
            ProtoCSPayloadType.PROTO_ASSET_LIST_REQ,
            'ProtoAssetListReq',
            'ProtoAssetListRes',
          );

          // Prepare the map with data
          forEach(assetData.asset || [], async (asset) => {
            await this.redis.hset(KEY, asset.name.toString(), asset.assetId.toString());
          });

          return map;
        } catch (err) {
          this.#logger.error('Failed to retrieve Assets from CT', err);
          return new Map();
        }
      },
      getCached.bind(this),
      KEY,
    );

    return data ?? new Map();
  }

  /**
   * Returns a map of Assets to their respective Asset id
   * @param managerApi The manager API client linked to the platform
   * @param assetId The id of the asset to get the data for
   */
  async getAssetMap(managerApi: CtManagerApiService, assetId: string): Promise<Map<string, ProtoAsset>> {
    const KEY = this.cacheKey('assets', managerApi);

    // Get the cached data we have
    const getCached = async () => {
      const assetMap = new Map<string, ProtoAsset>();
      const obj = (await this.redis.hgetall(KEY)) ?? {};
      for (const [key, value] of Object.entries(obj)) {
        const val = this.serializer.unSerialize(value);
        if (val) assetMap.set(key, val);
      }
      return assetMap;
    };

    // If the cache has the element we want, return the map
    const map = await getCached();
    if (map.has(assetId)) {
      return map;
    }

    const data = await this.debounceReq<Map<string, ProtoAsset>>(
      async () => {
        try {
          // Fetch the data from the platform
          const assetData = await managerApi.sendMessage<ProtoAssetListRes>(
            ProtoCSPayloadType.PROTO_ASSET_LIST_REQ,
            'ProtoAssetListReq',
            'ProtoAssetListRes',
          );

          // Prepare the map with data
          forEach(assetData.asset || [], async (asset) => {
            map.set(asset.assetId.toString(), asset);

            const val = this.serializer.serialize(asset);
            if (val) await this.redis.hset(KEY, asset.assetId.toString(), val);
          });

          return map;
        } catch (err) {
          this.#logger.error('Failed to retrieve Assets from CT', err);
          return new Map();
        }
      },
      getCached.bind(this),
      KEY,
    );

    return data ?? new Map();
  }

  /**
   * Returns a map of Asset Classes to their respective Asset Class ID
   * @param managerApi The manager API client linked to the platform
   * @param assetClassId The id of the asset class to get the data for
   */
  async getAssetClassMap(managerApi: CtManagerApiService, assetClassId: string): Promise<Map<string, ProtoAssetClass>> {
    const KEY = this.cacheKey('asset_classes', managerApi);

    // Get the cached data we have
    const getCached = async () => {
      const assetClassMap = new Map<string, ProtoAssetClass>();
      const obj = (await this.redis.hgetall(KEY)) ?? {};
      for (const [key, value] of Object.entries(obj)) {
        const val = this.serializer.unSerialize(value);
        if (val) assetClassMap.set(key, val);
      }
      return assetClassMap;
    };

    // If the cache has the element we want, return the map
    const map = await getCached();
    if (map.has(assetClassId)) {
      return map;
    }

    const data = await this.debounceReq<Map<string, ProtoAssetClass>>(
      async () => {
        try {
          // Fetch the data from the platform
          const assetClassData = await managerApi.sendMessage<ProtoAssetClassListRes>(
            ProtoCSPayloadType.PROTO_ASSET_CLASS_LIST_REQ,
            'ProtoAssetClassListReq',
            'ProtoAssetClassListRes',
          );

          // Prepare the map with data
          forEach(assetClassData.assetClass || [], async (assetClass) => {
            if (assetClass.id) {
              map.set(assetClass.id.toString(), assetClass);

              const val = this.serializer.serialize(assetClass);
              if (val) await this.redis.hset(KEY, assetClass.id.toString(), val);
            }
          });

          return map;
        } catch (err) {
          this.#logger.error('Failed to retrieve Asset Classes from CT', err);
          return new Map();
        }
      },
      getCached.bind(this),
      KEY,
    );

    return data ?? new Map();
  }

  /**
   * Returns a map of Trading Session Profiles to their respective Session Profile Ids
   * @param managerApi The manager API client linked to the platform
   * @param sessionProfileId The id of the asset to get the data for
   */
  async getTradingSessionMap(
    managerApi: CtManagerApiService,
    sessionProfileId: string,
  ): Promise<Map<string, ProtoScheduleProfile>> {
    const KEY = this.cacheKey('trading_sessions', managerApi);

    // Get the cached data we have
    const getCached = async () => {
      const tradingSessionMap = new Map<string, ProtoScheduleProfile>();
      const obj = (await this.redis.hgetall(KEY)) ?? {};
      for (const [key, value] of Object.entries(obj)) {
        const val = this.serializer.unSerialize(value);
        if (val) tradingSessionMap.set(key, val);
      }
      return tradingSessionMap;
    };

    // If the cache has the element we want, return the map
    const map = await getCached();
    if (map.has(sessionProfileId)) {
      return map;
    }

    const data = await this.debounceReq<Map<string, ProtoScheduleProfile>>(
      async () => {
        try {
          // Fetch the data from the platform
          const sessionData = await managerApi.sendMessage<ProtoScheduleProfileListRes>(
            ProtoCSPayloadType.PROTO_SCHEDULE_PROFILE_LIST_REQ,
            'ProtoScheduleProfileListReq',
            'ProtoScheduleProfileListRes',
          );

          // Prepare the map with data
          forEach(sessionData.scheduleProfile || [], async (profile) => {
            map.set(profile.scheduleProfileId.toString(), profile);

            const val = this.serializer.serialize(profile);
            if (val) await this.redis.hset(KEY, profile.scheduleProfileId.toString(), val);
          });

          return map;
        } catch (err) {
          this.#logger.error('Failed to retrieve Trading Session Profiles from CT', err);
          return new Map();
        }
      },
      getCached.bind(this),
      KEY,
    );

    return data ?? new Map();
  }

  /**
   * Returns a map of Symbol Categories to their respective SymbolCategory id
   * @param managerApi The manager API client linked to the platform
   * @param symbolCategoryId The id of the Symbol Category to get the data for
   */
  async getSymbolCategoryMap(
    managerApi: CtManagerApiService,
    symbolCategoryId: string,
  ): Promise<Map<string, ProtoSymbolCategory>> {
    const KEY = this.cacheKey('symbol_categories', managerApi);

    // Get the cached data we have
    const getCached = async () => {
      const symbolCatMap = new Map<string, ProtoSymbolCategory>();
      const obj = (await this.redis.hgetall(KEY)) ?? {};
      for (const [key, value] of Object.entries(obj)) {
        const val = this.serializer.unSerialize(value);
        if (val) symbolCatMap.set(key, val);
      }
      return symbolCatMap;
    };

    // If the cache has the element we want, return the map
    const map = await getCached();
    if (map.has(symbolCategoryId)) {
      return map;
    }

    const data = await this.debounceReq<Map<string, ProtoSymbolCategory>>(
      async () => {
        try {
          // Fetch the data from the platform
          const categoryData = await managerApi.sendMessage<ProtoSymbolCategoryListRes>(
            ProtoCSPayloadType.PROTO_SYMBOL_CATEGORY_LIST_REQ,
            'ProtoSymbolCategoryListReq',
            'ProtoSymbolCategoryListRes',
          );

          // Prepare the map with data
          forEach(categoryData.categories || [], async (category) => {
            map.set(category.assetClassId.toString(), category);

            const val = this.serializer.serialize(category);
            if (val) await this.redis.hset(KEY, category.assetClassId.toString(), val);
          });

          return map;
        } catch (err) {
          this.#logger.error('Failed to retrieve Symbol Categories from CT', err);
          return new Map();
        }
      },
      getCached.bind(this),
      KEY,
    );

    return data ?? new Map();
  }

  /**
   * Returns a map of Trading Holidays to their respective Holiday id
   * @param managerApi The manager API client linked to the platform
   * @param tradingHolidayId The id of the Trading Holiday to get the data for
   */
  async getHolidayMap(managerApi: CtManagerApiService, tradingHolidayId?: string): Promise<Map<string, ProtoHoliday>> {
    const KEY = this.cacheKey('holidays', managerApi);

    // Get the cached data we have
    const getCached = async () => {
      const holidayMap = new Map<string, ProtoHoliday>();
      const obj = (await this.redis.hgetall(KEY)) ?? {};
      for (const [key, value] of Object.entries(obj)) {
        const val = this.serializer.unSerialize(value);
        if (val) holidayMap.set(key, val);
      }
      return holidayMap;
    };

    // If the cache has the element we want, return the map
    const map = await getCached();
    if (map && (!tradingHolidayId || map.has(tradingHolidayId))) {
      return map;
    }

    const data = await this.debounceReq<Map<string, ProtoHoliday>>(
      async () => {
        try {
          // Fetch the data from the platform
          const holidayData = await managerApi.sendMessage<ProtoHolidayListRes>(
            ProtoCSPayloadType.PROTO_HOLIDAY_LIST_REQ,
            'ProtoHolidayListReq',
            'ProtoHolidayListRes',
          );

          // Prepare the map with data
          forEach(holidayData.holiday || [], async (holiday) => {
            if (holiday.holidayId) {
              map.set(holiday.holidayId.toString(), holiday);

              const val = this.serializer.serialize(holiday);
              if (val) await this.redis.hset(KEY, holiday.holidayId.toString(), val);
            }
          });

          return map;
        } catch (err) {
          this.#logger.error('Failed to retrieve Holidays from CT', err);
          return new Map();
        }
      },
      getCached.bind(this),
      KEY,
    );

    return data ?? new Map();
  }

  /**
   * Returns a map of Trading Holiday Profiles to their Profile id
   * @param managerApi The manager API client linked to the platform
   * @param tradingHolidayProfileId The id of the Trading Holiday Profile to get the data for
   */
  async getHolidayProfileMap(
    managerApi: CtManagerApiService,
    tradingHolidayProfileId?: string,
  ): Promise<Map<string, ProtoHolidayProfile>> {
    const KEY = this.cacheKey('holiday_profiles', managerApi);

    // Get the cached data we have
    const getCached = async () => {
      const holidayProfileMap = new Map<string, ProtoHolidayProfile>();
      const obj = (await this.redis.hgetall(KEY)) ?? {};
      for (const [key, value] of Object.entries(obj)) {
        const val = this.serializer.unSerialize(value);
        if (val) holidayProfileMap.set(key, val);
      }
      return holidayProfileMap;
    };

    // If the cache has the element we want, return the map
    const map = await getCached();
    if (map && (!tradingHolidayProfileId || map.has(tradingHolidayProfileId))) {
      return map;
    }

    const data = await this.debounceReq<Map<string, ProtoHolidayProfile>>(
      async () => {
        try {
          // Fetch the data from the platform
          const profileData = await managerApi.sendMessage<ProtoHolidayProfileListRes>(
            ProtoCSPayloadType.PROTO_HOLIDAY_PROFILE_LIST_REQ,
            'ProtoHolidayProfileListReq',
            'ProtoHolidayProfileListRes',
          );

          // Prepare the map with data
          forEach(profileData.holidayProfile || [], async (profile) => {
            if (profile.holidayProfileId) {
              map.set(profile.holidayProfileId.toString(), profile);

              const val = this.serializer.serialize(profile);
              if (val) await this.redis.hset(KEY, profile.holidayProfileId.toString(), val);
            }
          });

          return map;
        } catch (err) {
          this.#logger.error('Failed to retrieve Holiday Profiles from CT', err);
          return new Map();
        }
      },
      getCached.bind(this),
      KEY,
    );

    return data ?? new Map();
  }
}
