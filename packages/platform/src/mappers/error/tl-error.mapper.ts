import { AxiosError } from 'axios';
import { I18nContext } from 'nestjs-i18n';
import { Injectable } from '@nestjs/common';

import { isUnavailable } from '../../utils/http.utils';
import { sanitizeError } from '../../utils/sanitize-error.utils';
import { ErrorMapper, I18nErrorItem } from './error-mapper.interface';
import {
  PlatformException,
  InvalidServerCredentialsException,
  UnavailablePlatformServerException,
} from '../../exceptions';

type TlError = {
  message: string;
  status: string;
  statusCode: number;
  requestId: string;
};

@Injectable()
export class TlErrorMapper implements ErrorMapper {
  map(error: AxiosError | PlatformException): PlatformException {
    // If the error is an PlatformException, throw it.
    if (!(error instanceof AxiosError)) {
      throw error;
    }

    const baseURL = error.config?.baseURL ?? 'unknown TL server';

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
      const tlError = error?.response ? (error.response.data as TlError) : null;
      return new PlatformException(
        tlError ? `TL API Error - ${tlError?.statusCode}` : `TL API Error`,
        sanitizeError(error),
      );
    }

    const defaultError = i18n.t<any, I18nErrorItem>(`tl.DEFAULT`);

    if (!error?.response) {
      return new PlatformException(defaultError.msg, sanitizeError(error));
    }

    const tlError = error.response.data as TlError;
    if (!tlError) {
      return new PlatformException(defaultError.msg, sanitizeError(error));
    }

    const code = tlError.status;

    const key = `tl.${code}`;
    const entry = i18n.t<any, I18nErrorItem | string>(key, { defaultValue: key });

    if (typeof entry === 'string') {
      return new PlatformException(
        `${defaultError.msg}. ${tlError.message}. RequestId: ${tlError.requestId}`,
        sanitizeError(error),
      );
    }

    return new PlatformException(
      `${entry.msg}. ${tlError.message}. RequestId: ${tlError.requestId}`,
      sanitizeError(error),
      entry?.status ?? error.response.status,
    );
  }
}
