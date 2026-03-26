import { Injectable } from '@nestjs/common';

import { Side, OrderType } from '@crm/types';

import { Mt5OrderType } from '../../../types/mt5/trade/order.type';
import { InvalidMethodParametersException } from '../../../exceptions';

enum TypeFill {
  // For all positions
  ORDER_FILL_FOK = 'ORDER_FILL_FOK',
  // For all orders
  ORDER_FILL_RETURN = 'ORDER_FILL_RETURN',
}

enum Action {
  // Open position
  TA_DEALER_POS_EXECUTE = 'TA_DEALER_POS_EXECUTE',
  // Modify position
  TA_DEALER_POS_MODIFY = 'TA_DEALER_POS_MODIFY',
  // Close position (possibly at a future date???)
  TA_DEALER_CLOSE_BY = 'TA_DEALER_CLOSE_BY',
  // Open order
  TA_DEALER_ORD_PENDING = 'TA_DEALER_ORD_PENDING',
  // Modify order
  TA_DEALER_ORD_MODIFY = 'TA_DEALER_ORD_MODIFY',
  // Close order
  TA_DEALER_ORD_REMOVE = 'TA_DEALER_ORD_REMOVE',
}

enum Flag {
  // To modify an order or position
  TA_FLAG_NONE = 'TA_FLAG_NONE',
  // To close an order or position
  TA_FLAG_CLOSE = 'TA_FLAG_CLOSE',
}

interface MtCommand {
  priceSL: number;
  priceTP: number;
  action: Action;
  login: number;
  symbol: string;
  timeExpiration: number;
  type: string;
  typeFill: TypeFill;
  typeTime: 'ORDER_TIME_GTC' | 'ORDER_TIME_SPECIFIED' | 'ORDER_TIME_SPECIFIED_DAY';
  flags: Flag;
  volume: number;
  priceOrder: number;
  priceTrigger: number;
  priceDeviation: number;
  comment: string;
  position: number;
  positionBy: number;
  sourceLogin: number;
  order: number;
  timeout: number;
}

interface CmdDto {
  platformAccountId: string | number;
  platformOrderId?: string | number;
  platformPositionId?: string | number;
  symbol: string;
  type: Mt5OrderType;
  volume?: number;
  expiryTime?: number;
  triggerPrice?: number;
  takeProfit?: number;
  stopLoss?: number;
  comment?: string;
}

@Injectable()
export class CommandReqMapper {
  toCmdType(side: Side | OrderType): Mt5OrderType {
    switch (side.toString()) {
      case 'BUY':
        return 'OP_BUY';
      case 'SELL':
        return 'OP_SELL';
      case 'BUY_LIMIT':
        return 'OP_BUY_LIMIT';
      case 'BUY_STOP':
        return 'OP_BUY_STOP';
      case 'SELL_LIMIT':
        return 'OP_SELL_LIMIT';
      case 'SELL_STOP':
        return 'OP_SELL_STOP';
      case 'BUY_STOP_LIMIT':
        return 'OP_BUY_STOP_LIMIT';
      case 'SELL_STOP_LIMIT':
        return 'OP_SELL_STOP_LIMIT';
      default:
        throw new InvalidMethodParametersException(`Invalid Side or Order Type '${side}'`);
    }
  }

  toOrderOpenCmd(dto: CmdDto): MtCommand {
    const baseCmd = this.baseCmd(dto);
    baseCmd.typeFill = TypeFill.ORDER_FILL_RETURN;
    baseCmd.action = Action.TA_DEALER_ORD_PENDING;
    baseCmd.flags = Flag.TA_FLAG_NONE;

    return baseCmd as MtCommand;
  }

  toOrderUpdateCmd(dto: CmdDto): MtCommand {
    const baseCmd = this.baseCmd(dto);
    baseCmd.typeFill = TypeFill.ORDER_FILL_RETURN;
    baseCmd.action = Action.TA_DEALER_ORD_MODIFY;
    baseCmd.flags = Flag.TA_FLAG_NONE;

    return baseCmd as MtCommand;
  }

  toOrderCloseCmd(dto: CmdDto): MtCommand {
    const baseCmd = this.baseCmd(dto);
    baseCmd.typeFill = TypeFill.ORDER_FILL_RETURN;
    baseCmd.action = Action.TA_DEALER_ORD_REMOVE;
    baseCmd.flags = Flag.TA_FLAG_CLOSE;

    return baseCmd as MtCommand;
  }

  toPositionOpenCmd(dto: CmdDto): MtCommand {
    const baseCmd = this.baseCmd(dto);
    baseCmd.typeFill = TypeFill.ORDER_FILL_FOK;
    baseCmd.action = Action.TA_DEALER_POS_EXECUTE;
    baseCmd.flags = Flag.TA_FLAG_NONE;

    return baseCmd as MtCommand;
  }

  toPositionUpdateCmd(dto: CmdDto): MtCommand {
    const baseCmd = this.baseCmd(dto);
    baseCmd.typeFill = TypeFill.ORDER_FILL_FOK;
    baseCmd.action = Action.TA_DEALER_POS_MODIFY;
    baseCmd.flags = Flag.TA_FLAG_NONE;

    return baseCmd as MtCommand;
  }

  toPositionCloseCmd(dto: CmdDto): MtCommand {
    const baseCmd = this.baseCmd(dto);
    baseCmd.typeFill = TypeFill.ORDER_FILL_FOK;
    baseCmd.action = Action.TA_DEALER_POS_EXECUTE;
    baseCmd.flags = Flag.TA_FLAG_CLOSE;

    return baseCmd as MtCommand;
  }

  /**
   * Prepares a base MT5 command based on the dto data provided. This
   * command must be extended with the specific data for each command type.
   *
   * Note, in MT5 passing a 0 in commands is similar to a null value.
   * @param dto The dto to base the command on
   */
  private baseCmd(dto: CmdDto): Partial<MtCommand> {
    return {
      type: dto.type,
      symbol: dto.symbol,
      login: Number(dto.platformAccountId),
      volume: dto?.volume ?? 0,
      priceSL: dto?.stopLoss ?? 0,
      priceTP: dto?.takeProfit ?? 0,
      priceOrder: dto?.triggerPrice ?? 0,
      order: dto?.platformOrderId ? Number(dto.platformOrderId) : 0,
      position: dto?.platformPositionId ? Number(dto.platformPositionId) : 0,
      timeExpiration: dto?.expiryTime ?? 0,
      comment: dto?.comment ?? '',
      action: undefined,
      typeFill: undefined,
      flags: undefined,
      typeTime: dto?.expiryTime ? 'ORDER_TIME_SPECIFIED' : 'ORDER_TIME_GTC',
    };
  }
}
