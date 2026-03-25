import { Platform, IntegrationName } from '@crm/types';

export function toPlatform(name: IntegrationName): Platform {
  switch (name) {
    case IntegrationName.CTRADER:
      return Platform.CT;
    case IntegrationName.MT5:
      return Platform.MT5;
    case IntegrationName.DX_TRADER:
      return Platform.DX;
    case IntegrationName.YOUR_BOURSE:
      return Platform.YB;
    case IntegrationName.TRADE_LOCKER:
      return Platform.TL;
    default:
      throw new Error(`Unknown integration name '${name}'`);
  }
}
