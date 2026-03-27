import { Type } from 'class-transformer';
import { IsInt, IsEnum, IsString, IsOptional, IsNotEmpty, IsPositive } from 'class-validator';

import { TradingAccountStatus } from '@crm/types';

export class UpdateTradingAccountDto {
  /** The trading account leverage */
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  leverage?: number;

  /** A friendly name to assigned to the trading account */
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  friendlyName?: string;

  /** The trading account status */
  @IsOptional()
  @IsEnum(TradingAccountStatus)
  status?: TradingAccountStatus;
}
