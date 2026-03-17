import { Transform } from 'class-transformer';
import { IsEmail, Validate, IsString, IsNotEmpty, IsOptional } from 'class-validator';

import { toLowerCase, PasswordValidator } from '@crm/validation';

export class CreateTenantDto {
  /** The email address of the tenant */
  @Transform(toLowerCase)
  @IsEmail()
  email: string;

  /** The password of the tenant */
  @Validate(PasswordValidator)
  @IsNotEmpty()
  password: string;

  /** The first name of the tenant */
  @IsString()
  @IsNotEmpty()
  firstName: string;

  /** The middle name of the tenant */
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  middleName?: string;

  /** The last name of the tenant */
  @IsString()
  @IsNotEmpty()
  lastName: string;
}
