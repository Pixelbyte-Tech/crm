import { Type, Transform } from 'class-transformer';
import { IsInt, Validate, IsNumber, IsOptional, IsPositive, IsISO31661Alpha2 } from 'class-validator';

import { PaginatedReqDto } from '@crm/http';
import { toArray, toBoolean, toUpperCase, Iso4217OrCryptoValidator } from '@crm/validation';

export class ListSchemasDto extends PaginatedReqDto {
  /** Whether the schema is enabled and usable */
  @IsOptional()
  @Validate(toBoolean)
  @Transform(toBoolean)
  isEnabled?: boolean;

  /** Whether users must be KYC verified before creating an account */
  @IsOptional()
  @Validate(toBoolean)
  @Transform(toBoolean)
  isKycRequired?: boolean;

  /** The allowed account leverage values */
  @IsOptional()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  @Transform(toArray(Number))
  allowedLeverages?: number[];

  /** The allowed account currency values */
  @IsOptional()
  @Validate(Iso4217OrCryptoValidator, { each: true })
  @Transform(toArray(String))
  @Transform(toUpperCase)
  allowedCurrencies?: string[];

  /** Available to users in these countries. Leave null for no restrictions */
  @IsOptional()
  @IsISO31661Alpha2({ each: true })
  @Transform(toArray(String))
  @Transform(toUpperCase)
  allowedCountries?: string[];

  /** Exclude users in these countries. Leave null for no restrictions */
  @IsOptional()
  @IsISO31661Alpha2({ each: true })
  @Transform(toArray(String))
  @Transform(toUpperCase)
  excludedCountries?: string[];

  /** The minimum deposit amount allowed for accounts created with this schema. Leave null for no limit */
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  minDepositAmountUsd?: number;

  /** The maximum deposit amount allowed for accounts created with this schema. Leave null for no limit */
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  maxDepositAmountUsd?: number;

  /** The maximum number of accounts a user can have with this schema. Leave null for no limit */
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  maxAccountsPerUser?: number;
}
