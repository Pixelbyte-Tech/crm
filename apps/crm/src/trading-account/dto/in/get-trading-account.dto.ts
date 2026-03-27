import { Transform } from 'class-transformer';
import { Validate, IsOptional } from 'class-validator';

import { toBoolean } from '@crm/validation';

export class GetTradingAccountDto {
  /** Whether to include the account balance */
  @IsOptional()
  @Validate(toBoolean)
  @Transform(toBoolean)
  incBalance?: boolean;

  /** Whether to include the account user group */
  @IsOptional()
  @Validate(toBoolean)
  @Transform(toBoolean)
  incUserGroup?: boolean;
}
