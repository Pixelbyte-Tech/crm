import { PlatformException } from './platform.exception';

export class UnknownSymbolException extends PlatformException {
  constructor(symbol: string, cause?: unknown) {
    super(`Symbol '${symbol}' does not exist on the platform server.`, cause);
  }
}
