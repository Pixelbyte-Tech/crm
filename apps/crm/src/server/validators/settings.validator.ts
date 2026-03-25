import { plainToInstance } from 'class-transformer';
import {
  ValidationArguments,
  ValidatorConstraint,
  validate as validateObject,
  ValidatorConstraintInterface,
} from 'class-validator';

import {
  Platform,
  DxServerSettingsDto,
  TlServerSettingsDto,
  CtServerSettingsDto,
  YbServerSettingsDto,
  Mt5ServerSettingsDto,
} from '@crm/types';

import { UnknownPlatformException } from '../exceptions';

@ValidatorConstraint({ async: true })
export class SettingsValidator implements ValidatorConstraintInterface {
  async validate(value: any, args: ValidationArguments) {
    const parent = args.object as { platform: Platform };
    const platform: Platform = parent.platform;

    let target: any;
    switch (platform) {
      case Platform.CT:
        target = CtServerSettingsDto;
        break;
      case Platform.DX:
        target = DxServerSettingsDto;
        break;
      case Platform.MT5:
        target = Mt5ServerSettingsDto;
        break;
      case Platform.TL:
        target = TlServerSettingsDto;
        break;
      case Platform.YB:
        target = YbServerSettingsDto;
        break;

      default:
        throw new UnknownPlatformException(platform);
    }

    // Convert plain value to target class and validate it
    const instance = plainToInstance(target, value ?? {});
    const errors = await validateObject(instance);
    return errors.length === 0;
  }

  defaultMessage() {
    return 'settings do not match the server platform or contain invalid fields';
  }
}
