export enum TlOrderStatus {
  STATUS_NONE = 'STATUS_NONE',
  STATUS_PENDING_NEW = 'STATUS_PENDING_NEW',
  STATUS_PENDING_EXECUTION = 'STATUS_PENDING_EXECUTION',
  STATUS_PENDING_CANCEL = 'STATUS_PENDING_CANCEL',
  STATUS_PENDING_REPLACE = 'STATUS_PENDING_REPLACE',
  STATUS_PENDING_REPLACE_NOT_ACTIVE = 'STATUS_PENDING_REPLACE_NOT_ACTIVE',
  STATUS_NEW = 'STATUS_NEW',
  STATUS_ACCEPTED = 'STATUS_ACCEPTED',
  STATUS_REPLACED = 'STATUS_REPLACED',
  STATUS_PART_FILLED = 'STATUS_PART_FILLED',
  STATUS_FILLED = 'STATUS_FILLED',
  STATUS_CANCELED = 'STATUS_CANCELED',
  STATUS_REFUSED = 'STATUS_REFUSED',
  STATUS_RESTATED = 'STATUS_RESTATED',
  EXEC_TYPE_ACTIVATED = 'EXEC_TYPE_ACTIVATED',
  STATUS_WAITING_MARKET = 'STATUS_WAITING_MARKET',
  STATUS_OFF_MARKET = 'STATUS_OFF_MARKET',
  STATUS_UNPLACED = 'STATUS_UNPLACED',
  STATUS_REMOVED = 'STATUS_REMOVED',
  STATUS_MODIFY_TRADING_MODE = 'STATUS_MODIFY_TRADING_MODE',
}

export interface TlOrder {
  accountId: string;
  amount: string;
  lotSize: string;
  averageFilledPrice: string;
  createdDateTime?: string; // format '2021-06-01T12:00:00.000Z';
  expireDateTime?: string; // format '2021-06-01T12:00:00.000Z';
  filledAmount: string;
  orderId: string;
  positionId: string;
  price: string;
  side: 'BUY' | 'SELL' | 'SHORT_SELL' | 'BUY_TO_COVER';
  slLimitPrice?: string;
  slPrice?: string;
  slPriceType: 'ABSOLUTE' | 'OFFSET' | 'TRAILING_STOP_OFFSET';
  status: TlOrderStatus;
  stopPrice?: string;
  tif: 'DAY' | 'GTC' | 'IOC' | 'GTD' | 'FOK' | 'MOO' | 'MOC' | 'GTS';
  tpPrice?: string;
  tpPriceType: 'ABSOLUTE' | 'OFFSET' | 'TRAILING_STOP_OFFSET';
  instrument: string;
  type: 'MANUAL' | 'STOP' | 'LIMIT' | 'STOP_LIMIT' | 'TRAILING_STOP';
  remoteHost?: string;
  brokerComment?: string;
}
