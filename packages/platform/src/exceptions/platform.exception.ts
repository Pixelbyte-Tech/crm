export class PlatformException extends Error {
  httpStatus = 500;

  constructor(
    msg: string,
    readonly cause?: unknown,
    status?: number,
  ) {
    super(msg);
    if (status) this.setHttpStatus(status);
  }

  setHttpStatus(status: number): this {
    this.httpStatus = status;
    return this;
  }
}
