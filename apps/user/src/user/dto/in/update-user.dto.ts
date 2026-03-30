import { Type, Transform } from 'class-transformer';
import { Min, Max, IsInt, IsEnum, IsEmail, Validate, IsString, IsNotEmpty, IsOptional } from 'class-validator';

import { UserStatus } from '@crm/types';
import { toBoolean, toLowerCase, BooleanValidator, PasswordValidator } from '@crm/validation';

export class UpdateUserDto {
  /** The email address of the user */
  @IsOptional()
  @Transform(toLowerCase)
  @IsEmail()
  email?: string;

  /** The password of the user */
  @IsOptional()
  @Validate(PasswordValidator)
  @IsNotEmpty()
  password?: string | null;

  /** The first name of the user */
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  firstName?: string | null;

  /** The first name of the user */
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  middleName?: string | null;

  /** The last name of the user */
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  lastName?: string | null;

  /** The new status for the user */
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  /** The new status for the user */
  @IsOptional()
  @IsInt()
  @Min(1000)
  @Max(9999)
  @Type(() => Number)
  securityPin?: number;

  /** Whether the user has accepted cookies, privacy policy, and terms of service */
  @IsOptional()
  @Validate(BooleanValidator)
  @Transform(toBoolean)
  isCookiesAccepted?: boolean;

  /** Whether the user has accepted the privacy policy */
  @IsOptional()
  @Validate(BooleanValidator)
  @Transform(toBoolean)
  isPrivacyAccepted?: boolean;

  /** Whether the user has accepted the terms of service */
  @IsOptional()
  @Validate(BooleanValidator)
  @Transform(toBoolean)
  isTermsAccepted?: boolean;
}
