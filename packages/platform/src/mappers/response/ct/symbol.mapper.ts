import { Injectable } from '@nestjs/common';

import { CtManagerApiService } from '../../../services/ct/manager/ct-manager-api.service';

import { Symbol } from '../../../models/symbol';
import { CtMapperHelper } from '../../helper/ct-mapper.helper';
import { TradingSessions } from '../../../models/trading-session';
import { ScheduleProfileMapper } from './schedule-profile.mapper';
import { ProtoManagerSymbol } from '../../../services/ct/manager/proto/base/ts';

@Injectable()
export class SymbolMapper {
  constructor(
    private readonly scheduleProfileMapper: ScheduleProfileMapper,
    private readonly helper: CtMapperHelper,
  ) {}

  /**
   * Converts a ProtoManagerSymbol to a Symbol
   * @param symbol The ProtoManagerSymbols to convert
   * @param managerApi The manager API client linked to the platform
   */
  async toSymbol(symbol: ProtoManagerSymbol, managerApi: CtManagerApiService): Promise<Symbol> {
    // Find the min/max volume for the symbol
    let minVolume: number = 0;
    let maxVolume: number = 0;
    if (symbol.defaultVolumeProfileId) {
      const defaultVolumeProfileId = symbol.defaultVolumeProfileId.toString();
      const volumeProfiles = await this.helper.getVolumeProfileMap(managerApi, defaultVolumeProfileId);

      minVolume = Number(volumeProfiles.get(defaultVolumeProfileId)?.minVolume || 0);
      maxVolume = Number(volumeProfiles.get(defaultVolumeProfileId)?.maxVolume || 0);
    }

    // Find the base asset for the symbol
    let base: string = '';
    if (symbol.baseAssetId) {
      const assets = await this.helper.getAssetMap(managerApi, symbol.baseAssetId.toString());
      base = assets.get(symbol.baseAssetId.toString())?.name || '';
    }

    // Find the quote asset for the symbol
    let quote: string = '';
    if (symbol.quoteAssetId) {
      const quoteAssetId = symbol.quoteAssetId.toString();
      const assets = await this.helper.getAssetMap(managerApi, quoteAssetId);
      quote = assets.get(quoteAssetId)?.name || '';
    }

    // Find the trading session for the symbol
    let tradingSession: TradingSessions | undefined;
    if (symbol.scheduleProfileId) {
      const scheduleProfileId = symbol.scheduleProfileId.toString();
      const profiles = await this.helper.getTradingSessionMap(managerApi, scheduleProfileId);
      const profile = profiles.get(scheduleProfileId);
      if (profile) {
        tradingSession = this.scheduleProfileMapper.toTradingSessions(profile);
      }
    }

    // Find the security for the symbol
    let security: string | undefined;
    if (symbol.symbolCategoryId) {
      const symbolCategoryId = symbol.symbolCategoryId.toString();
      const categories = await this.helper.getSymbolCategoryMap(managerApi, symbolCategoryId);

      const category = categories.get(symbolCategoryId);
      if (category) {
        const categoryAssetClassId = category.assetClassId.toString();
        const assetClasses = await this.helper.getAssetClassMap(managerApi, categoryAssetClassId);
        security = assetClasses.get(categoryAssetClassId)?.name;
      }
    }

    return new Symbol({
      name: symbol.name!,
      description: symbol.description!,
      security,
      base,
      quote,
      spreadBuy: symbol.bidMarkUp ?? 0,
      spreadSell: symbol.askMarkUp ?? 0,
      contractSize: Number(symbol.lotSize ?? 0),
      minVolume,
      maxVolume,
      pointValue: symbol.digits ? 1 / Math.pow(10, symbol.digits) : 0,
      digits: symbol.digits!,
      tradingSession,
    });
  }

  /**
   * Converts an array ProtoManagerSymbol to a Symbol
   * @param symbols The ProtoManagerSymbols to convert
   * @param managerApi The manager API client linked to the platform
   */
  async toSymbols(symbols: ProtoManagerSymbol[], managerApi: CtManagerApiService): Promise<Symbol[]> {
    const result: Symbol[] = [];
    for (const symbol of symbols) {
      result.push(await this.toSymbol(symbol, managerApi));
    }

    return result;
  }
}
