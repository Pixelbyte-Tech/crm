import { PlatformException } from './platform.exception';

export class InvalidMethodParametersException extends PlatformException {
  constructor(message?: string, cause?: unknown) {
    super(message || 'Required parameters for method call not found or incorrect.', cause);
  }
}
