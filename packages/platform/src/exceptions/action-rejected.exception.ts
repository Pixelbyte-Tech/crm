import { PlatformException } from './platform.exception';

export class ActionRejectedException extends PlatformException {
  constructor(cause?: unknown) {
    super(`The requested action was rejected by the trading platform`, cause);
  }
}
