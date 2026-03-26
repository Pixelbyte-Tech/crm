import { AxiosError } from 'axios';
import { I18nContext } from 'nestjs-i18n';
import {
  Injectable,
  HttpException,
  ConflictException,
  BadGatewayException,
  BadRequestException,
  GatewayTimeoutException,
  ServiceUnavailableException,
  InternalServerErrorException,
} from '@nestjs/common';

import { isUnavailable } from '../../utils/http.utils';
import { sanitizeError } from '../../utils/sanitize-error.utils';
import { ErrorMapper, I18nErrorItem } from './error-mapper.interface';
import {
  PlatformException,
  DuplicateAccountIdException,
  InvalidServerCredentialsException,
  UnavailablePlatformServerException,
} from '../../exceptions';

type Mt5Error = {
  ErrorCode: number;
  Message: string;
};

@Injectable()
export class Mt5ErrorMapper implements ErrorMapper {
  map(error: AxiosError | PlatformException): HttpException {
    // If the error is an PlatformException, throw it.
    if (!(error instanceof AxiosError)) {
      throw error;
    }

    const baseURL = error.config?.baseURL ?? 'unknown MT5 server';

    // If the error indicates the platform server is unavailable
    if (isUnavailable(error)) {
      throw new UnavailablePlatformServerException(baseURL);
    }

    // If the error indicates the credentials are invalid
    if (401 === error.response?.status) {
      throw new InvalidServerCredentialsException(baseURL);
    }

    const i18n = I18nContext.current();
    if (!i18n) {
      const mt5Error = error?.response ? (error.response.data as Mt5Error) : null;
      return new InternalServerErrorException(
        mt5Error ? `MT5 API Error - ${this.#getErrorCode(mt5Error?.Message)}` : `MT5 API Error`,
        { cause: sanitizeError(error) },
      );
    }

    const defaultError = i18n.t<any, I18nErrorItem>(`mt5.DEFAULT`);

    if (!error?.response) {
      return new InternalServerErrorException(defaultError.msg, { cause: sanitizeError(error) });
    }

    const mt5Error = error.response.data as Mt5Error;
    if (!mt5Error) {
      return new InternalServerErrorException(defaultError.msg, { cause: sanitizeError(error) });
    }

    const code = this.#getErrorCode(mt5Error?.Message);

    const key = `mt5.${code}`;
    const entry = i18n.t<any, I18nErrorItem | string>(key, { defaultValue: key });

    if (typeof entry === 'string') {
      return new InternalServerErrorException(defaultError.msg + ` (${code})`, {
        cause: sanitizeError(error),
      });
    }

    // Special case for duplicate account ids on the platform
    if (mt5Error?.Message.match(/User with login '.*' alredy exist \(MT_RET_ERROR\)/)) {
      throw new DuplicateAccountIdException(null, error);
    }

    switch (entry?.status ?? error.response.status) {
      case 400:
        return new BadRequestException(error.message, { cause: sanitizeError(error) });
      case 408:
        return new GatewayTimeoutException(error.message, { cause: sanitizeError(error) });
      case 409:
        return new ConflictException(error.message, { cause: sanitizeError(error) });
      case 502:
        return new BadGatewayException(error.message, { cause: sanitizeError(error) });
      case 403:
      case 503:
        return new ServiceUnavailableException(error.message, { cause: sanitizeError(error) });
      default:
        return new ServiceUnavailableException(error.message, { cause: sanitizeError(error) });
    }
  }

  /**
   * Returns the MT5 error code from the message
   * @param message The error message
   */
  #getErrorCode(message?: string): string {
    let code = 'DEFAULT';
    if (message) {
      const matches = /.*\W*\((MT_[A-Z_]*)\)/gm.exec(message);
      code = matches?.length ? matches[matches.length - 1] : code;
    }

    return code;
  }
}
