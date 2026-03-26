export abstract class PlatformException extends Error {
  protected constructor(
    msg: string,
    readonly cause?: unknown,
  ) {
    super(msg);
  }
}
