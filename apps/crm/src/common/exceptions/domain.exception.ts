export class DomainException extends Error {
  httpStatus = 500;

  constructor(
    message: string,
    readonly cause?: Error,
  ) {
    super(message);
  }

  setHttpStatus(status: number): this {
    this.httpStatus = status;
    return this;
  }
}
