export type Mt5OrderType =
  | 'OP_BUY'
  | 'OP_SELL'
  | 'OP_BUY_LIMIT'
  | 'OP_SELL_LIMIT'
  | 'OP_BUY_STOP'
  | 'OP_SELL_STOP'
  | 'OP_BUY_STOP_LIMIT'
  | 'OP_SELL_STOP_LIMIT';

export interface Mt5Order {
  print: string;
  order: number;
  externalID: string;
  login: number;
  dealer: number;
  symbol: string;
  digits: number;
  digitsCurrency: number;
  contractSize: number;
  state: 'ORDER_STATE_STARTED' | 'ORDER_STATE_PLACED' | 'ORDER_STATE_CANCELED';
  reason: 'ORDER_REASON_CLIENT';
  timeSetup: number;
  timeExpiration: number;
  timeDone: number;
  type: Mt5OrderType;
  typeFill: 'ORDER_FILL_FOK';
  typeTime: 'ORDER_TIME_GTC';
  priceOrder: number;
  priceTrigger: number;
  priceCurrent: number;
  priceSL: number;
  priceTP: number;
  volumeInitial: number;
  volumeCurrent: number;
  expertID: number;
  positionID: number;
  comment: string;
  activationMode: 'ACTIVATION_NONE';
  activationTime: number;
  activationPrice: number;
  activationFlags: 'ACTIV_FLAGS_NO_LIMIT';
  timeSetupMsc: number;
  timeDoneMsc: number;
  rateMargin: number;
  positionByID: number;
  modificationFlags: 'MODIFY_FLAGS_ADMIN';
  volumeInitialExt: number;
  volumeCurrentExt: number;
  volumeInitialLots: number;
  volumeCurrentLots: number;
}
