import { isObject } from 'lodash';
import { AxiosError } from 'axios';
import { I18nContext } from 'nestjs-i18n';
import { Injectable } from '@nestjs/common';

import { isUnavailable } from '../../utils/http.utils';
import { sanitizeError } from '../../utils/sanitize-error.utils';
import { ErrorMapper, I18nErrorItem } from './error-mapper.interface';
import { CtManagerApiException } from '../../services/ct/manager/ct-manager-api.exception';
import {
  PlatformException,
  UnparseableResponseException,
  UnsupportedOperationException,
  UnprocessableResponseException,
  InvalidMethodParametersException,
  InvalidServerCredentialsException,
  UnavailablePlatformServerException,
} from '../../exceptions';

type CtError =
  | {
      error: {
        errorCode: string;
        description: string;
      };
    }
  | string;

type ctReportingError = { timestamp: string; status: number; error: string; path: string };

@Injectable()
export class CtErrorMapper implements ErrorMapper {
  /**
   * Maps a Reporting API error to an PlatformException.
   * @param error The Reporting API Axios error.
   */
  mapSnapshotApiError(error: AxiosError): PlatformException {
    const baseURL = error.config?.baseURL ?? 'unknown CT Snapshot server';

    // If the error indicates the platform server is unavailable
    if (isUnavailable(error)) {
      return new UnavailablePlatformServerException(baseURL, error);
    }

    const data = error.response?.data;
    if (!data) {
      return new UnprocessableResponseException('cTrader Snapshot API', data, error);
    }

    try {
      const ctError: ctReportingError = JSON.parse(Buffer.from(data as string).toString());
      switch (ctError?.status) {
        case 404:
          return new UnsupportedOperationException('cTrader Snapshot API');
        default:
          return new InvalidMethodParametersException(`The request to ${ctError.path} failed with '${ctError.error}'`, {
            cause: error,
          });
      }
    } catch {
      return new UnparseableResponseException('cTrader Snapshot API');
    }
  }

  /**
   * Maps a Manager API error to an HttpException.
   * @param ex The Manager API exception.
   */
  mapManagerApiError(ex: CtManagerApiException): PlatformException {
    const i18n = I18nContext.current();
    if (!i18n) {
      return new PlatformException('CT Manager API Error', ex);
    }

    const key = `ct.${ex.code}`;
    const entry = i18n.t<any, I18nErrorItem | string>(key, { defaultValue: key });
    if (typeof entry === 'string') {
      const defaultError = i18n.t<any, I18nErrorItem>(`ct.DEFAULT`);
      return new PlatformException(defaultError.msg + ` (${ex.code})`, ex);
    }

    return new PlatformException(entry?.msg + ` (${ex.code})`, sanitizeError(ex), entry?.status);
  }

  /**
   * Maps an Axios error to an HttpException.
   * @param error The Axios error.
   */
  map(error: AxiosError | PlatformException): PlatformException {
    // If the error is an PlatformException, throw it.
    if (!(error instanceof AxiosError)) {
      throw error;
    }

    const baseURL = error.config?.baseURL ?? 'unknown CT HTTP server';

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
      return new PlatformException('CT API Error', sanitizeError(error));
    }

    const defaultError = i18n.t<any, I18nErrorItem>(`ct.DEFAULT`);

    if (!error?.response) {
      return new PlatformException(defaultError.msg, sanitizeError(error));
    }

    const ctError = error.response.data as CtError;
    if (!ctError) {
      return new PlatformException(defaultError.msg, sanitizeError(error));
    }

    // Find the error code
    let code = isObject(ctError) ? ctError.error.errorCode : ctError?.split(':')[0];
    if (code.startsWith('<html')) {
      code = 'DEFAULT';
    }

    const key = `ct.${code}`;
    const entry = i18n.t<any, I18nErrorItem | string>(key, { defaultValue: key });

    if (typeof entry === 'string') {
      return new PlatformException(defaultError.msg + ` (${code})`, sanitizeError(error));
    }

    return new PlatformException(entry?.msg + ` (${code})`, sanitizeError(error), entry?.status);
  }
}
