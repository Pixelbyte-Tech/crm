import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsPositive, IsDateString } from 'class-validator';

export class UpdateOrderDto {
  /** The price at which to trigger the order */
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  triggerPrice?: number;

  /** A take profit amount to set on the position once it is opened */
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  takeProfit?: number;

  /** A stop loss amount to set on the position once it is opened */
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  stopLoss?: number;

  /** The date at which the order expires */
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  constructor(data: UpdateOrderDto) {
    this.triggerPrice = data.triggerPrice;
    this.takeProfit = data.takeProfit;
    this.stopLoss = data.stopLoss;
    this.expiresAt = data.expiresAt;
  }
}
