export interface Mt5CommandResponse {
  print: string;
  id: number;
  login: number;
  group: string;
  symbol: string;
  digits: number;
  action:
    | 'TA_PRICE'
    | 'TA_DEALER_POS_EXECUTE'
    | 'TA_DEALER_POS_MODIFY'
    | 'TA_DEALER_CLOSE_BY'
    | 'TA_DEALER_ORD_PENDING'
    | 'TA_DEALER_ORD_MODIFY'
    | 'TA_DEALER_ORD_REMOVE';
  timeExpiration: number;
  type: 'OP_FIRST';
  typeFill: 'ORDER_FILL_FOK' | 'ORDER_FILL_RETURN';
  typeTime: 'ORDER_TIME_GTC';
  flags: 'TA_FLAG_CLOSE' | 'TA_FLAG_NONE';
  volume: number;
  order: number;
  orderExternalID: string;
  priceOrder: number;
  priceTrigger: number;
  priceSL: number;
  priceTP: number;
  priceDeviation: number;
  priceDeviationTop: number;
  priceDeviationBottom: number;
  comment: string;
  resultRetcode: 'MT_RET_OK';
  resultDealer: number;
  resultDeal: number;
  resultOrder: number;
  resultVolume: number;
  resultPrice: number;
  resultDealerBid: number;
  resultDealerAsk: number;
  resultDealerLast: number;
  resultMarketBid: number;
  resultMarketAsk: number;
  resultMarketLast: number;
  resultComment: string;
  externalAccount: string;
  idClient: number;
  ip: string;
  sourceLogin: number;
  position: number;
  positionBy: number;
  positionExternalID: string;
  positionByExternalID: string;
  volumeExt: number;
  resultVolumeExt: number;
  volumeLots: number;
  resultVolumeLots: number;
}
