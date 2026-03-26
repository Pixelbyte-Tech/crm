import Long from 'long';
import { Injectable } from '@nestjs/common';

import { CtManagerApiService } from '../../../services/ct/manager/ct-manager-api.service';

import { UpdatePositionDto } from '../../../dto/update-position.dto';

import { CtMapperHelper } from '../../helper/ct-mapper.helper';
import { UnknownPositionException, ServerConfigurationMissingException } from '../../../exceptions';
import {
  ProtoPosition,
  ProtoManagerAmendPositionReq,
  ProtoManagerClosePositionReq,
} from '../../../services/ct/manager/proto/base/ts';

@Injectable()
export class PositionReqMapper {
  constructor(private readonly helper: CtMapperHelper) {}

  toManagerAmendPositionReq(
    traderId: string,
    positionId: string,
    dto: UpdatePositionDto,
  ): ProtoManagerAmendPositionReq {
    return {
      traderId: Long.fromValue(traderId),
      positionId: Long.fromValue(positionId),
      stopLoss: dto.stopLoss,
      takeProfit: dto.takeProfit,
    };
  }

  async toManagerClosePositionReq(
    traderId: string,
    position: ProtoPosition,
    managerApi: CtManagerApiService,
    lots?: number,
  ): Promise<ProtoManagerClosePositionReq> {
    const { tradeData } = position;
    if (!tradeData) {
      throw new UnknownPositionException(position.positionId.toNumber());
    }

    // Get the symbol id
    const symbolId = tradeData.symbolId.toString();

    // Get the symbol data
    const symbolMap = await this.helper.getSymbolMap(managerApi, symbolId);
    const symbol = symbolMap.get(symbolId);
    if (!symbol || !symbol.lotSize) {
      throw new ServerConfigurationMissingException(`Unable to determine lot size for symbol ${symbolId}`);
    }

    // Prepare the volume to close
    const volume = lots
      ? Long.fromValue(Math.max(lots * Number(symbol.lotSize), tradeData.volume?.toNumber()))
      : Long.fromValue(tradeData.volume?.toNumber() * 100);

    return {
      traderId: Long.fromValue(traderId),
      positionId: Long.fromValue(position.positionId),
      volume,
    };
  }
}
