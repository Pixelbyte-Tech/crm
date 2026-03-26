import { PlatformException } from './platform.exception';

export class UnknownTradeSessionInstrumentsException extends PlatformException {
  constructor(tradeSessionId: number, cause?: unknown) {
    super(`Unknown instruments for Trade Session '${tradeSessionId}' on platform server.`, cause);
  }
}
