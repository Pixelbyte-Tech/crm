import { AxiosError } from 'axios';
import { I18nContext } from 'nestjs-i18n';
import { Injectable } from '@nestjs/common';

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
  map(error: AxiosError | PlatformException): PlatformException {
    // If the error is an PlatformException, throw it.
    if (!(error instanceof AxiosError)) {
      throw error;
    }

    const baseURL = error.config?.baseURL ?? 'unknown MT5 server';

    // If the error indicates the platform server is unavailable
    if (isUnavailable(error)) {
      return new UnavailablePlatformServerException(baseURL);
    }

    // If the error indicates the credentials are invalid
    if (401 === error.response?.status) {
      return new InvalidServerCredentialsException(baseURL);
    }

    const i18n = I18nContext.current();
    if (!i18n) {
      const mt5Error = error?.response ? (error.response.data as Mt5Error) : null;
      return new PlatformException(
        mt5Error ? `MT5 API Error - ${this.#getErrorCode(mt5Error?.Message)}` : `MT5 API Error`,
        error,
      );
    }

    const defaultError = i18n.t<any, I18nErrorItem>(`mt5.DEFAULT`);

    if (!error?.response) {
      return new PlatformException(defaultError.msg, sanitizeError(error));
    }

    const mt5Error = error.response.data as Mt5Error;
    if (!mt5Error) {
      return new PlatformException(defaultError.msg, sanitizeError(error));
    }

    const code = this.#getErrorCode(mt5Error?.Message);

    const key = `mt5.${code}`;
    const entry = i18n.t<any, I18nErrorItem | string>(key, { defaultValue: key });

    if (typeof entry === 'string') {
      return new PlatformException(defaultError.msg + ` (${code})`, sanitizeError(error));
    }

    // Special case for duplicate account ids on the platform
    if (mt5Error?.Message.match(/User with login '.*' alredy exist \(MT_RET_ERROR\)/)) {
      return new DuplicateAccountIdException(null, error);
    }

    return new PlatformException(error.message, sanitizeError(error), entry?.status ?? error.response.status);
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
