import { Transform } from 'class-transformer';
import { Validate, IsOptional } from 'class-validator';

import { toBoolean, BooleanValidator } from '@crm/validation';

export class GetTradingAccountDto {
  /** Whether to include the account balance */
  @IsOptional()
  @Validate(BooleanValidator)
  @Transform(toBoolean)
  incBalance?: boolean;

  /** Whether to include the account user group */
  @IsOptional()
  @Validate(BooleanValidator)
  @Transform(toBoolean)
  incUserGroup?: boolean;
}
