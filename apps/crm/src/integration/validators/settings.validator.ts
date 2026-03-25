import { plainToInstance } from 'class-transformer';
import {
  ValidationArguments,
  ValidatorConstraint,
  validate as validateObject,
  ValidatorConstraintInterface,
} from 'class-validator';

import {
  TlSettingsDto,
  CtSettingsDto,
  DxSettingsDto,
  Mt5SettingsDto,
  IntegrationName,
  SendxSettingsDto,
  HeliosSettingsDto,
  OnfidoSettingsDto,
  SumSubSettingsDto,
  BridgerPaySettingsDto,
  YourBourseSettingsDto,
  CryptochillSettingsDto,
} from '@crm/types';

import { UnknownIntegrationNameException } from '../exceptions';

@ValidatorConstraint({ async: true })
export class SettingsValidator implements ValidatorConstraintInterface {
  async validate(value: any, args: ValidationArguments) {
    const parent = args.object as { name: IntegrationName };
    const name: IntegrationName = parent.name;

    let target: any;
    switch (name) {
      case IntegrationName.BRIDGER_PAY:
        target = BridgerPaySettingsDto;
        break;
      case IntegrationName.CRYPTOCHILL:
        target = CryptochillSettingsDto;
        break;
      case IntegrationName.CTRADER:
        target = CtSettingsDto;
        break;
      case IntegrationName.DX_TRADER:
        target = DxSettingsDto;
        break;
      case IntegrationName.HELIOS:
        target = HeliosSettingsDto;
        break;
      case IntegrationName.MT5:
        target = Mt5SettingsDto;
        break;
      case IntegrationName.ONFIDO:
        target = OnfidoSettingsDto;
        break;
      case IntegrationName.SENDX:
        target = SendxSettingsDto;
        break;
      case IntegrationName.SUMSUB:
        target = SumSubSettingsDto;
        break;
      case IntegrationName.TRADE_LOCKER:
        target = TlSettingsDto;
        break;
      case IntegrationName.YOUR_BOURSE:
        target = YourBourseSettingsDto;
        break;
      default:
        throw new UnknownIntegrationNameException(name);
    }

    // Convert plain value to target class and validate it
    const instance = plainToInstance(target, value ?? {});
    const errors = await validateObject(instance);
    return errors.length === 0;
  }

  defaultMessage() {
    return 'settings do not match the selected integration or contain invalid fields';
  }
}
