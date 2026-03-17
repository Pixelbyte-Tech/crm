import { Transform } from 'class-transformer';
import { IsEmail, Validate, IsString, IsNotEmpty, IsOptional } from 'class-validator';

import { toLowerCase, PasswordValidator } from '@crm/validation';

export class CreateUserDto {
  /** The email address of the user */
  @Transform(toLowerCase)
  @IsEmail()
  email: string;

  /** The password of the user */
  @Validate(PasswordValidator)
  @IsNotEmpty()
  password: string;

  /** The first name of the user */
  @IsString()
  @IsNotEmpty()
  firstName: string;

  /** The middle name of the user */
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  middleName?: string;

  /** The last name of the user */
  @IsString()
  @IsNotEmpty()
  lastName: string;
}
