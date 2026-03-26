import { Type, Transform } from 'class-transformer';
import {
  IsInt,
  IsString,
  Validate,
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  ValidateNested,
  IsISO31661Alpha2,
} from 'class-validator';

import { toArray, toBoolean, toUpperCase, Iso4217OrCryptoValidator } from '@crm/validation';

import { SchemaLeverageDto } from './schema-leverage.dto';

export class CreateSchemaDto {
  /** A friendly name for the schema */
  @IsNotEmpty()
  @IsString()
  name: string;

  /** The schema description  */
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  description?: string | null;

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
  allowedLeverages?: number[] | null;

  /** Any leverage overwrites applicable to the schema */
  @IsOptional()
  @ValidateNested()
  @Type(() => SchemaLeverageDto)
  leverageOverwrites?: SchemaLeverageDto[] | null;

  /** The allowed account currency values */
  @IsOptional()
  @Validate(Iso4217OrCryptoValidator, { each: true })
  @Transform(toArray(String))
  @Transform(toUpperCase)
  allowedCurrencies?: string[] | null;

  /** Available to users in these countries. Leave null for no restrictions */
  @IsOptional()
  @IsISO31661Alpha2({ each: true })
  @Transform(toArray(String))
  @Transform(toUpperCase)
  allowedCountries?: string[] | null;

  /** Exclude users in these countries. Leave null for no restrictions */
  @IsOptional()
  @IsISO31661Alpha2({ each: true })
  @Transform(toArray(String))
  @Transform(toUpperCase)
  excludedCountries?: string[] | null;

  /** The minimum deposit amount allowed for accounts created with this schema. Leave null for no limit */
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  minDepositAmountUsd?: number | null;

  /** The maximum deposit amount allowed for accounts created with this schema. Leave null for no limit */
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  maxDepositAmountUsd?: number | null;

  /** The maximum number of accounts a user can have with this schema. Leave null for no limit */
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  maxAccountsPerUser?: number | null;

  /** The user group id in the platform that will be assigned to users with accounts created with this schema */
  @IsString()
  @IsNotEmpty()
  platformUserGroupId: string;
}
