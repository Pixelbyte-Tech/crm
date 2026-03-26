import { Injectable } from '@nestjs/common';

import { Symbol } from '../../../models/symbol';
import { TlInstrument } from '../../../types/tl/symbol/instrument.type';

@Injectable()
export class SymbolMapper {
  toSymbol(instrument: TlInstrument): Symbol {
    return new Symbol({
      name: instrument.name,
      security: instrument.groupName,
      description: instrument.description,
      base: instrument.base ?? undefined,
      quote: instrument.quote ?? undefined,
      spreadBuy: 0,
      spreadSell: 0,
      contractSize: Number(instrument.lotSize),
      minVolume: Number(instrument.minLotSize),
      maxVolume: !Number(instrument.maxLotSize) ? 10_000 : Number(instrument.maxLotSize),
      pointValue: Number(instrument.pointValue),
      digits: Number(instrument.precision),
      tradingSession: undefined,
    });
  }

  toSecurity(instrument: TlInstrument): string | null {
    return instrument.groupName ?? null;
  }
}
