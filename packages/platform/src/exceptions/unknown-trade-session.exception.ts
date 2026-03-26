import { PlatformException } from './platform.exception';

export class UnknownTradeSessionException extends PlatformException {
  constructor(tradeSessionId: number, cause?: unknown) {
    super(`Trade Session '${tradeSessionId}' not found or does not exist on the platform server.`, cause);
  }
}
