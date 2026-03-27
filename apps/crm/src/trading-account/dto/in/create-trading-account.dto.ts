import { Type, Transform } from 'class-transformer';
import { IsInt, IsEnum, Validate, IsString, IsOptional, IsNotEmpty, IsPositive } from 'class-validator';

import { Monetisation } from '@crm/types';
import {
  toUpperCase,
  UserIdValidator,
  ServerIdValidator,
  PasswordValidator,
  Iso4217OrCryptoValidator,
} from '@crm/validation';

export class CreateTradingAccountDto {
  /** The user to whom the new trading account should belong */
  @Validate(UserIdValidator)
  userId: string;

  /** The server on which to create the trading account */
  @Validate(ServerIdValidator)
  serverId: string;

  /** The chosen trading account leverage */
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  leverage: number;

  /** The currency of the new trading account */
  @Validate(Iso4217OrCryptoValidator)
  @Transform(toUpperCase)
  currency: string;

  /** The monetisation of the trading account */
  @IsEnum(Monetisation)
  monetisation: Monetisation;

  /** The user group id in the platform that will be used */
  @IsString()
  @IsNotEmpty()
  platformUserGroupId: string;

  /** A friendly name to assign to the trading account */
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  friendlyName?: string;

  /** The password to use in the trading platform, if omitted a password will be generated automatically */
  @IsOptional()
  @Validate(PasswordValidator)
  password?: string;

  /** Lead generation source for the trading account */
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  leadSource?: string;
}
