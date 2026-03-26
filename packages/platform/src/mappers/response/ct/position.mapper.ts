import { DateTime } from 'luxon';
import { Injectable } from '@nestjs/common';

import { Side, PositionStatus } from '@crm/types';

import { CtManagerApiService } from '../../../services/ct/manager/ct-manager-api.service';

import { Position } from '../../../models/position';
import { CtMapperHelper } from '../../helper/ct-mapper.helper';
import { UnprocessableResponseException } from '../../../exceptions';
import { ClosePositionResult } from '../../../models/close-position-result';
import {
  ProtoDeal,
  ProtoOrder,
  ProtoPosition,
  ProtoTradeSide,
  ProtoPositionStatus,
} from '../../../services/ct/manager/proto/base/ts';

@Injectable()
export class PositionMapper {
  constructor(private readonly helper: CtMapperHelper) {}

  async toPosition(
    pos: ProtoPosition,
    managerApi: CtManagerApiService,
    serverMsToUtcMs: (n: number) => number,
    order?: ProtoOrder,
    deal?: ProtoDeal,
  ): Promise<Position> {
    // Ensure the order has trade data
    if (!pos.tradeData || !pos.tradeData.traderId) {
      throw new UnprocessableResponseException('position tradeData', pos.tradeData);
    }

    // Get the symbol data
    const symbolId = pos.tradeData.symbolId.toString();
    const symbolMap = await this.helper.getSymbolMap(managerApi, symbolId);

    const symbol = symbolMap.get(symbolId);
    if (!symbol || !symbol.lotSize) {
      throw new UnprocessableResponseException('position symbol', symbol);
    }

    // Identify the time the order was placed
    let openedAt: Date | undefined;
    let closedAt: Date | undefined;

    if (pos.tradeData.openTimestamp && pos.tradeData.openTimestamp.toNumber() > 0) {
      openedAt = DateTime.fromMillis(serverMsToUtcMs(pos.tradeData.openTimestamp.toNumber())).toJSDate();
    }

    if (pos.tradeData.closeTimestamp && pos.tradeData.closeTimestamp.toNumber() > 0) {
      closedAt = DateTime.fromMillis(serverMsToUtcMs(pos.tradeData.closeTimestamp.toNumber())).toJSDate();
    }

    // Calculate the lots
    const lots = deal
      ? Number(deal.filledVolume) / Number(symbol.lotSize)
      : Number(pos.tradeData.volume) / Number(symbol.lotSize);

    // Calculate the TP/SL
    let takeProfit: number | undefined = pos.takeProfit;
    let stopLoss: number | undefined = pos.stopLoss;

    if (order) {
      takeProfit = this.#calculateTakeProfit(
        pos.price ?? 0,
        pos.tradeData.tradeSide,
        order.relativeTakeProfit?.toNumber(),
      );
      stopLoss = this.#calculateStopLoss(pos.price ?? 0, pos.tradeData.tradeSide, order.relativeStopLoss?.toNumber());
    }

    return new Position({
      openedAt,
      closedAt,
      accountId: pos.tradeData.traderId.toString(),
      positionId: pos.positionId.toString(),
      tradeId: deal?.dealId?.toString(),
      symbol: symbol.name,
      openPrice: pos.price ?? 0,
      closePrice: deal?.closePositionDetail ? deal.executionPrice : undefined,
      takeProfit: takeProfit,
      stopLoss: stopLoss,
      lots: lots,
      spread: undefined,
      commission: pos.commission?.toNumber(),
      swap: pos.swap?.toNumber(),
      profit: deal?.closePositionDetail?.profit?.toNumber(),
      comment: pos.tradeData.comment,
      side: this.#toPositionSide(pos.tradeData.tradeSide),
      status: this.#toPositionStatus(pos.positionStatus),
    });
  }

  toClosePositionResult(
    pos: ProtoPosition,
    deal: ProtoDeal,
    serverMsToUtcMs: (n: number) => number,
  ): ClosePositionResult {
    // Calculate the lots remaining
    let lotsRemaining = 0;
    if (pos.tradeData?.volume && pos.tradeData?.lotSize) {
      lotsRemaining = pos.tradeData.volume.toNumber() / pos.tradeData.lotSize.toNumber();
    }

    return new ClosePositionResult({
      platformPositionId: deal.positionId.toString(),
      platformTradeId: deal.dealId.toString(),
      closePrice: deal.executionPrice,
      closedAt: DateTime.fromMillis(serverMsToUtcMs(deal.executionTimestamp.toNumber())).toJSDate(),
      profit: deal.closePositionDetail?.profit?.toNumber(),
      lotsRemaining: lotsRemaining,
    });
  }

  /**
   * Calculate the take profit price
   * @param price The price the position was opened at
   * @param tradeSide The side of the trade
   * @param relativeTakeProfit The relative take profit amount
   */
  #calculateTakeProfit(price: number, tradeSide: ProtoTradeSide, relativeTakeProfit?: number): number | undefined {
    if (!relativeTakeProfit || 0 === relativeTakeProfit) {
      return undefined;
    }

    return tradeSide === ProtoTradeSide.BUY
      ? price + relativeTakeProfit / 100_000
      : price - relativeTakeProfit / 100_000;
  }

  /**
   * Calculate the stop loss price
   * @param price The price the position was opened at
   * @param tradeSide The side of the trade
   * @param relativeStopLoss The relative stop loss amount
   */
  #calculateStopLoss(price: number, tradeSide: ProtoTradeSide, relativeStopLoss?: number): number | undefined {
    if (!relativeStopLoss || 0 === relativeStopLoss) {
      return undefined;
    }

    return tradeSide === ProtoTradeSide.BUY ? price - relativeStopLoss / 100_000 : price + relativeStopLoss / 100_000;
  }

  /**
   * Convert the position side from the platform to the internal type
   * @param tradeSide The side of the trade
   */
  #toPositionSide(tradeSide: ProtoTradeSide): Side {
    switch (tradeSide) {
      case ProtoTradeSide.BUY:
        return Side.BUY;
      case ProtoTradeSide.SELL:
        return Side.SELL;
    }

    throw new UnprocessableResponseException('position side', tradeSide);
  }

  /**
   * Convert the position status from the platform to the internal status
   * @param status The status from the platform
   */
  #toPositionStatus(status: ProtoPositionStatus): PositionStatus {
    switch (status) {
      case ProtoPositionStatus.POSITION_STATUS_CREATED:
      case ProtoPositionStatus.POSITION_STATUS_OPEN:
        return PositionStatus.OPEN;
      case ProtoPositionStatus.POSITION_STATUS_CLOSED:
        return PositionStatus.FULL_CLOSE;
    }

    throw new UnprocessableResponseException('position status', status);
  }
}
