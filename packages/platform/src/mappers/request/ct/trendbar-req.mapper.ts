import Long from 'long';
import { Injectable } from '@nestjs/common';

import { CtManagerApiService } from '../../../services/ct/manager/ct-manager-api.service';

import { UnknownSymbolException } from '../../../exceptions';
import { CtMapperHelper } from '../../helper/ct-mapper.helper';
import { ProtoTimeframe, ProtoTrendbarType, ProtoTrendbarListReq } from '../../../services/ct/manager/proto/base/ts';

@Injectable()
export class TrendbarReqMapper {
  constructor(private readonly helper: CtMapperHelper) {}

  /**
   * Returns a ProtoTrendbarListReq for the given symbol
   * @param symbol The symbol for which to create the request
   * @param startSecUTC The start time in seconds since epoch
   * @param endSecUTC The end time in seconds since epoch
   * @param managerApi The ManagerAPI service
   * @param utcSecToServerSec The function to convert UTC seconds to server seconds
   */
  async toTrendbarListReq(
    symbol: string,
    startSecUTC: number,
    endSecUTC: number,
    managerApi: CtManagerApiService,
    utcSecToServerSec: (n: number) => number,
  ): Promise<ProtoTrendbarListReq> {
    const map = await this.helper.getSymbolIdsMap(managerApi, symbol);

    const symbolId = map.get(symbol);
    if (!symbolId) {
      throw new UnknownSymbolException(symbol);
    }

    return {
      symbolId: Long.fromValue(symbolId),
      period: ProtoTimeframe.M_1,
      fromTimestamp: Long.fromValue(utcSecToServerSec(startSecUTC) * 1000),
      toTimestamp: Long.fromValue(utcSecToServerSec(endSecUTC) * 1000),
      type: ProtoTrendbarType.REGULAR_OHLC,
    };
  }
}
