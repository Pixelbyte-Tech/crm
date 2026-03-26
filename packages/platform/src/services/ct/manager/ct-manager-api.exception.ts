import { PlatformException } from '../../../exceptions';

/** Represents the type of exception thrown by the Manager API */
export class CtManagerApiException extends PlatformException {
  constructor(
    readonly code: string,
    readonly msg?: string,
    readonly cause?: unknown,
  ) {
    super(msg ?? 'CT Manager API API Error');
  }
}
