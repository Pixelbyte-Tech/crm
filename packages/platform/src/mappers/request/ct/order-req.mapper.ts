import { randomUUID } from 'crypto';

import Long from 'long';
import { DateTime } from 'luxon';
import { Injectable } from '@nestjs/common';

import { Side, OrderType } from '@crm/types';

import { CtManagerApiService } from '../../../services/ct/manager/ct-manager-api.service';

import { OpenOrderDto } from '../../../dto/open-order.dto';
import { UpdateOrderDto } from '../../../dto/update-order.dto';
import { OpenPositionDto } from '../../../dto/open-position.dto';

import { CtMapperHelper } from '../../helper/ct-mapper.helper';
import { UnknownSymbolException, ServerConfigurationMissingException } from '../../../exceptions';
import {
  ProtoOrderType,
  ProtoTradeSide,
  ProtoTimeInForce,
  ProtoCSPayloadType,
  ProtoManagerNewOrderReq,
  ProtoPendingOrderListRes,
  ProtoManagerAmendOrderReq,
} from '../../../services/ct/manager/proto/base/ts';

@Injectable()
export class OrderReqMapper {
  constructor(private readonly helper: CtMapperHelper) {}

  async toManagerNewOrderReq(
    traderId: string,
    dto: OpenOrderDto | OpenPositionDto,
    managerApi: CtManagerApiService,
    utcSecToServerSec: (n: number) => number,
  ): Promise<ProtoManagerNewOrderReq> {
    // Convert the symbol to symbolId
    const idMap = await this.helper.getSymbolIdsMap(managerApi, dto.symbol);
    const symbolId = idMap.get(dto.symbol);
    if (!symbolId) {
      throw new UnknownSymbolException(dto.symbol);
    }

    // Get the symbol data
    const symbolMap = await this.helper.getSymbolMap(managerApi, symbolId);
    const symbol = symbolMap.get(symbolId);
    if (!symbol || !symbol.lotSize) {
      throw new ServerConfigurationMissingException(`Unable to determine lot size for ${dto.symbol}`);
    }

    // Prepare the expiry timestamp
    let expirationTimestamp: Long | undefined;
    let timeInForce: ProtoTimeInForce = ProtoTimeInForce.IMMEDIATE_OR_CANCEL;
    if ('expiresAt' in dto && dto.expiresAt) {
      const sec = utcSecToServerSec(DateTime.fromISO(dto.expiresAt).toUnixInteger());
      expirationTimestamp = Long.fromValue(DateTime.fromSeconds(sec).toMillis());
      timeInForce = ProtoTimeInForce.GOOD_TILL_DATE;
    }

    // Prepare the order direction
    let side: ProtoTradeSide;

    const sideOrType = 'type' in dto ? dto.type : dto.side;
    switch (sideOrType) {
      case Side.BUY:
      case OrderType.BUY_LIMIT:
      case OrderType.BUY_STOP:
      case OrderType.BUY_STOP_LIMIT:
        side = ProtoTradeSide.BUY;
        break;
      default:
        side = ProtoTradeSide.SELL;
        break;
    }

    // Prepare the type and prices
    let stopPrice: number | undefined;
    let limitPrice: number | undefined;
    let relativeTakeProfit: Long | undefined;
    let relativeStopLoss: Long | undefined;
    let takeProfit: number | undefined;
    let stopLoss: number | undefined;

    let type: ProtoOrderType;

    // Fetch the market price for the symbol
    const price = await (await managerApi.marketPrices()).byId(Number(symbolId));

    switch (sideOrType) {
      case Side.BUY:
        type = ProtoOrderType.MARKET;

        if (price?.ask && (dto.takeProfit || dto.stopLoss)) {
          relativeTakeProfit = dto.takeProfit ? Long.fromValue((dto.takeProfit - price.ask) * 100_000) : undefined;
          relativeStopLoss = dto.stopLoss ? Long.fromValue((price.ask - dto.stopLoss) * 100_000) : undefined;
        }
        break;
      case Side.SELL:
        type = ProtoOrderType.MARKET;

        if (price?.bid && (dto.takeProfit || dto.stopLoss)) {
          relativeTakeProfit = dto.takeProfit ? Long.fromValue((price.bid - dto.takeProfit) * 100_000) : undefined;
          relativeStopLoss = dto.stopLoss ? Long.fromValue((dto.stopLoss - price.bid) * 100_000) : undefined;
        }
        break;
      case OrderType.BUY_STOP:
      case OrderType.SELL_STOP:
        type = ProtoOrderType.STOP;
        stopPrice = (dto as OpenOrderDto).triggerPrice;

        takeProfit = dto.takeProfit;
        stopLoss = dto.stopLoss;
        break;
      case OrderType.BUY_STOP_LIMIT:
      case OrderType.SELL_STOP_LIMIT:
        type = ProtoOrderType.STOP_LIMIT;
        stopPrice = (dto as OpenOrderDto).triggerPrice;

        takeProfit = dto.takeProfit;
        stopLoss = dto.stopLoss;
        break;
      default:
        type = ProtoOrderType.LIMIT;
        limitPrice = (dto as OpenOrderDto).triggerPrice;

        takeProfit = dto.takeProfit;
        stopLoss = dto.stopLoss;
        break;
    }

    return {
      traderId: Long.fromValue(traderId),
      symbolId: Long.fromValue(symbolId),
      clientOrderId: randomUUID(),
      orderType: type,
      tradeSide: side,
      volume: Long.fromValue(dto.lots * Number(symbol.lotSize)),
      limitPrice,
      stopPrice,
      expirationTimestamp,
      timeInForce,
      takeProfit,
      stopLoss,
      relativeTakeProfit,
      relativeStopLoss,
      comment: dto.comment,
    };
  }

  async toManagerAmendOrderReq(
    traderId: string,
    orderId: string,
    dto: UpdateOrderDto,
    managerApi: CtManagerApiService,
    utcSecToServerSec: (n: number) => number,
  ): Promise<ProtoManagerAmendOrderReq> {
    // Prepare the expiry timestamp
    let expirationTimestamp: Long | undefined;
    let timeInForce: ProtoTimeInForce | undefined = undefined;

    if (dto.expiresAt) {
      const sec = utcSecToServerSec(DateTime.fromISO(dto.expiresAt).toUnixInteger());
      expirationTimestamp = Long.fromValue(DateTime.fromSeconds(sec).toMillis());
      timeInForce = ProtoTimeInForce.GOOD_TILL_DATE;
    }

    let limitPrice: number | undefined;
    let stopPrice: number | undefined;

    // If the price is changing we need to fetch the order to know
    // whether it is a stop or a limit order
    if (dto.triggerPrice) {
      // Check if the trader has any pending orders
      const data = await managerApi.sendMessage<ProtoPendingOrderListRes>(
        ProtoCSPayloadType.PROTO_PENDING_ORDER_LIST_REQ,
        'ProtoPendingOrderListReq',
        'ProtoPendingOrderListRes',
        {
          traderId: Long.fromValue(traderId),
          fromTimestamp: Long.fromValue(utcSecToServerSec(DateTime.utc().minus({ year: 2 }).toMillis())),
          toTimestamp: Long.fromValue(utcSecToServerSec(DateTime.utc().plus({ minute: 10 }).toMillis())),
        },
      );

      // Assign the limit and stop prices if they exist
      const order = data?.order.find((o) => o.orderId.toString() === orderId);
      if (order?.limitPrice) {
        limitPrice = dto.triggerPrice;
      }
      if (order?.stopPrice) {
        stopPrice = dto.triggerPrice;
      }
    }

    return {
      traderId: Long.fromValue(traderId),
      orderId: Long.fromValue(orderId),
      limitPrice,
      stopPrice,
      expirationTimestamp,
      timeInForce,
      takeProfit: dto.takeProfit,
      stopLoss: dto.stopLoss,
    };
  }
}
