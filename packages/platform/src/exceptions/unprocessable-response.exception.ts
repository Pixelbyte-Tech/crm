import { PlatformException } from './platform.exception';

export class UnprocessableResponseException extends PlatformException {
  constructor(type: string, value: any, cause?: unknown) {
    super(`Unable to process response for '${type}' with value '${value.toString()}'`, cause);
  }
}
