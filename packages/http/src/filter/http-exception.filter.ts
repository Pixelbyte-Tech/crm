import { Response } from 'express';
import { set, isArray, isObject } from 'lodash';
import { ValidationError } from 'class-validator';
import { SentryExceptionCaptured } from '@sentry/nestjs';
import { QueryFailedError, EntityNotFoundError, CannotCreateEntityIdMapError } from 'typeorm';
import { Catch, Logger, HttpStatus, ArgumentsHost, HttpException, ExceptionFilter } from '@nestjs/common';

type PreparedException = {
  message: string;
  status: HttpStatus;
  errors?: string[] | object;
  cause?: string;
};

const DEFAULT_ERROR_MESSAGE = 'Something went wrong, please try again.';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  @SentryExceptionCaptured()
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    let data: PreparedException;

    // Prepare the exception for logging and response
    if (
      exception instanceof ValidationError ||
      (isArray(exception) && exception.every((e) => e instanceof ValidationError))
    ) {
      data = this.#prepareValidationException(exception);
    } else if (exception instanceof HttpException) {
      data = this.#prepareHttpException(exception);
    } else {
      data = this.#prepareAnyException(exception);
    }

    // Log the exception (preserving the initial cause)
    const logData = {
      url: req.url,
      method: req.method,
      stack: exception?.stack,
      message: exception?.message,
      ...('cause' in exception ? { err: exception.cause } : {}),
    };

    Logger.error(exception.name, logData, this.constructor.name);

    // Send the response
    return res.status(data.status).send({
      statusCode: data.status,
      data: null,
      message: data.message,
      ...(data.cause ? { cause: data.cause } : {}),
      ...(data.errors
        ? { errors: isObject(data.errors) || Array.isArray(data.errors) ? data.errors : [data.errors] }
        : {}),
    });
  }

  /**
   * Prepare the HttpException for logging and response
   * @param exception The HttpException to prepare
   */
  #prepareHttpException(exception: HttpException): PreparedException {
    const status = exception.getStatus();
    const response = exception.getResponse() as {
      error: string;
      message: string[];
    };

    const message = response.message?.toString() || DEFAULT_ERROR_MESSAGE;

    return { status, message, cause: response.error?.toString() };
  }

  /**
   * Prepare any other exception for logging and response
   * @param exceptions The exceptions to prepare
   */
  #prepareValidationException(exceptions: ValidationError | ValidationError[]): PreparedException {
    return {
      status: HttpStatus.BAD_REQUEST,
      message: 'Validation failed',
      errors: this.#findValidationExceptions(exceptions),
    };
  }

  /**
   * Find the validation exceptions and prepare them for response
   * @param exceptions The exceptions to find
   * @param errors The errors to prepare
   */
  #findValidationExceptions(exceptions: ValidationError | ValidationError[], errors = {}): any {
    if (!Array.isArray(exceptions)) {
      exceptions = [exceptions];
    }

    for (const e of exceptions) {
      if (e.children?.length) {
        return this.#findValidationExceptions(e.children, errors);
      }
      if (!e.constraints) {
        continue;
      }
      set(errors, e.property, Object.values(e.constraints)[0]);
    }

    return errors;
  }

  /**
   * Prepare any other exception for logging and response
   * @param exception The exception to prepare
   */
  #prepareAnyException(exception: any): PreparedException {
    let status: HttpStatus;

    switch (exception.constructor) {
      case QueryFailedError:
        status = HttpStatus.UNPROCESSABLE_ENTITY;
        break;
      case EntityNotFoundError:
        status = HttpStatus.NOT_FOUND;
        break;
      case CannotCreateEntityIdMapError:
        status = HttpStatus.UNPROCESSABLE_ENTITY;
        break;
      default:
        status = HttpStatus.INTERNAL_SERVER_ERROR;
    }

    const msg = exception.response?.message;
    const message = 'string' === typeof msg && msg.length > 0 ? exception.response?.message : DEFAULT_ERROR_MESSAGE;

    return { status, message };
  }
}
