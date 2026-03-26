type Mt5PositionAction = 'POSITION_BUY' | 'POSITION_SELL';

export interface Mt5Position {
  print: string;
  login: number;
  symbol: string;
  action: Mt5PositionAction;
  digits: number;
  digitsCurrency: number;
  contractSize: number;
  timeCreate: number;
  timeUpdate: number;
  priceOpen: number;
  priceCurrent: number;
  priceSL: number;
  priceTP: number;
  volume: number;
  profit: number;
  storage: number;
  rateProfit: number;
  rateMargin: number;
  expertID: number;
  expertPositionID: number;
  comment: string;
  activationMode: 'ACTIVATION_NONE';
  activationTime: number;
  activationPrice: number;
  activationFlags: 'ACTIV_FLAGS_NO_LIMIT';
  timeCreateMsc: number;
  timeUpdateMsc: number;
  dealer: number;
  position: number;
  externalID: string;
  modificationFlags: number;
  reason: number;
  volumeExt: number;
  volumeLots: number;
}
