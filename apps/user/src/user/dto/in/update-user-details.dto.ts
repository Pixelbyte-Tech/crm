import { Type, Transform } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsString,
  Validate,
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsISO31661Alpha3,
} from 'class-validator';

import { UserExperience, UserEmploymentStatus } from '@crm/types';
import { toArray, toBoolean, BooleanValidator } from '@crm/validation';

export class UpdateUserDetailsDto {
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  birthday?: Date | null;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  phone?: string | null;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  addressLine1?: string | null;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  addressLine2?: string | null;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  city?: string | null;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  postcode?: string | null;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  state?: string | null;

  @IsOptional()
  @IsISO31661Alpha3()
  country?: string | null;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  taxId?: string | null;

  @IsOptional()
  @Validate(BooleanValidator)
  @Transform(toBoolean)
  isPoaVerified?: boolean;

  @IsOptional()
  @Validate(BooleanValidator)
  @Transform(toBoolean)
  isPoiVerified?: boolean;

  @IsOptional()
  @Validate(BooleanValidator)
  @Transform(toBoolean)
  isPowVerified?: boolean;

  @IsOptional()
  @Validate(BooleanValidator)
  @Transform(toBoolean)
  isPoliticallyExposed?: boolean;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  netCapitalUsd?: number | null;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  annualIncomeUsd?: number | null;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  approxAnnualInvestmentVolumeUsd?: number | null;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  occupation?: string | null;

  @IsOptional()
  @IsEnum(UserEmploymentStatus)
  employmentStatus?: UserEmploymentStatus | null;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  sourceOfFunds?: string | null;

  @IsOptional()
  @IsEnum(UserExperience, { each: true })
  @Transform(toArray(String))
  experience?: UserExperience[] | null;
}
