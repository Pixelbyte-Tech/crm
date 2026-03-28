import { Type, Transform } from 'class-transformer';
import { IsInt, IsEnum, Validate, IsString, IsOptional, IsNotEmpty, IsPositive } from 'class-validator';

import { Monetisation } from '@crm/types';
import { TradingAccountSchemaEntity } from '@crm/database';
import { toUpperCase, UserIdValidator, PasswordValidator, Iso4217OrCryptoValidator } from '@crm/validation';

export class CreateTradingAccountDto {
  /** The user to whom the new trading account should belong */
  @Validate(UserIdValidator)
  userId: string;

  /** The trading account schema id defining this account */
  @Validate(TradingAccountSchemaEntity)
  schemaId: string;

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
