import {
  TlSettingsDto,
  CtSettingsDto,
  DxSettingsDto,
  Mt5SettingsDto,
  SendxSettingsDto,
  HeliosSettingsDto,
  OnfidoSettingsDto,
  SumSubSettingsDto,
  BridgerPaySettingsDto,
  YourBourseSettingsDto,
  CryptochillSettingsDto,
} from '@crm/types';

export type IntegrationSetting =
  | BridgerPaySettingsDto
  | CryptochillSettingsDto
  | CtSettingsDto
  | DxSettingsDto
  | HeliosSettingsDto
  | Mt5SettingsDto
  | OnfidoSettingsDto
  | SendxSettingsDto
  | SumSubSettingsDto
  | TlSettingsDto
  | YourBourseSettingsDto;
