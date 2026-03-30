import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common';
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@Injectable()
@ValidatorConstraint({ name: 'passwordValidator' })
export class PasswordValidator implements ValidatorConstraintInterface, PipeTransform {
  /**
   * Validates the value making sure it is a complex password
   * @param value The value to validate
   */
  validate(value: unknown): boolean {
    return null !== value?.toString().match(/^(?=(.*[a-z])+)(?=(.*[A-Z])+)(?=(.*[0-9])+)(?=(.*[!@#$%^~*_.])+).{8,}$/);
  }

  /**
   * Transforms the value to a string
   * @param value The value to transform
   */
  transform(value: unknown): string {
    if (!this.validate(value)) {
      throw new BadRequestException(
        this.defaultMessage({ property: 'password', value, constraints: [], object: {}, targetName: '' }),
      );
    }
    return String(value);
  }

  /**
   * Returns the default error message
   * @param validationArguments The validation arguments
   */
  defaultMessage(validationArguments?: ValidationArguments): string {
    return `${validationArguments?.property ?? 'Password'} min 8 chars, contain a number, uppercase letter, and char in (!@#$%^~*_.).`;
  }
}
