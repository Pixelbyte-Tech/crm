import { Transform } from 'class-transformer';
import { Validate, IsNumber, IsOptional, IsPositive } from 'class-validator';

import { toBoolean, BooleanValidator } from '@crm/validation';

export class UpdateUserSettingsDto {
  @IsOptional()
  @Validate(BooleanValidator)
  @Transform(toBoolean)
  canDeposit?: boolean;

  @IsOptional()
  @Validate(BooleanValidator)
  @Transform(toBoolean)
  canWithdraw?: boolean;

  @IsOptional()
  @Validate(BooleanValidator)
  @Transform(toBoolean)
  canAutoWithdraw?: boolean;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  maxAutoWithdrawAmount?: number | null;
}
