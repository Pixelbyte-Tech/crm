import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common';
import { ArgumentMetadata } from '@nestjs/common/interfaces/features/pipe-transform.interface';
import {
  ValidationArguments,
  ValidatorConstraint,
  isISO4217CurrencyCode,
  ValidatorConstraintInterface,
} from 'class-validator';

@Injectable()
@ValidatorConstraint({ name: 'currencyOrCryptoValidator' })
export class Iso4217OrCryptoValidator implements ValidatorConstraintInterface, PipeTransform {
  /**
   * Validates the value making sure it is an ISO4217 or a crypto
   * @param value The value to validate
   */
  validate(value: unknown): boolean {
    if (value === undefined || value === null) {
      return false;
    }

    return isISO4217CurrencyCode(value) || ['BTC', 'BIT', 'ETH'].includes(value.toString().toLowerCase());
  }

  /**
   * Transforms the value to uppercase
   * @param value The value to transform
   * @param metadata The metadata about the value
   */
  transform(value: any, metadata: ArgumentMetadata): boolean {
    if (!this.validate(value)) {
      throw new BadRequestException(
        this.defaultMessage({
          property: metadata.data ?? 'Field',
          value: value,
          constraints: [],
          object: {},
          targetName: '',
        }),
      );
    }

    return value.toUpperCase();
  }

  /**
   * Returns the default error message
   * @param validationArguments The validation arguments
   */
  defaultMessage(validationArguments?: ValidationArguments): string {
    return `${validationArguments?.property ?? 'Field'} must be ISO4217 or crypto`;
  }
}
