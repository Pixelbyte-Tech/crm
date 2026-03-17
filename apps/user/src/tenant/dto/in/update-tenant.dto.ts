import { Transform } from 'class-transformer';
import { IsEnum, IsEmail, Validate, IsString, IsNotEmpty, IsOptional } from 'class-validator';

import { TenantStatus } from '@crm/types';
import { toLowerCase, PasswordValidator } from '@crm/validation';

export class UpdateTenantDto {
  /** The email address of the tenant */
  @IsOptional()
  @Transform(toLowerCase)
  @IsEmail()
  email?: string;

  /** The password of the tenant */
  @IsOptional()
  @Validate(PasswordValidator)
  @IsNotEmpty()
  password?: string | null;

  /** The first name of the tenant */
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  firstName?: string | null;

  /** The first name of the tenant */
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  middleName?: string | null;

  /** The last name of the tenant */
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  lastName?: string | null;

  /** The new status for the tenant */
  @IsOptional()
  @IsEnum(TenantStatus)
  status?: TenantStatus;
}
