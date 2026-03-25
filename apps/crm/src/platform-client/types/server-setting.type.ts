import {
  CtServerSettingsDto,
  DxServerSettingsDto,
  TlServerSettingsDto,
  YbServerSettingsDto,
  Mt5ServerSettingsDto,
} from '@crm/types';

export type ServerSetting =
  | CtServerSettingsDto
  | DxServerSettingsDto
  | Mt5ServerSettingsDto
  | TlServerSettingsDto
  | YbServerSettingsDto;
