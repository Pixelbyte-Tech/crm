import { PlatformException } from './platform.exception';

export class ServerConfigurationMissingException extends PlatformException {
  constructor(message?: string, cause?: unknown) {
    super(message || 'A required configuration on platform server is missing', cause);
  }
}
