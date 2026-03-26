import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsPositive } from 'class-validator';

export class UpdatePositionDto {
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

  constructor(data: UpdatePositionDto) {
    this.stopLoss = data.stopLoss;
    this.takeProfit = data.takeProfit;
  }
}
