import { isObject } from 'lodash';
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
  mapManagerApiError(ex: CtManagerApiException): HttpException {
    const i18n = I18nContext.current();
    if (!i18n) {
      return new InternalServerErrorException('CT Manager API Error', { cause: ex });
    }

    const key = `ct.${ex.code}`;
    const entry = i18n.t<any, I18nErrorItem | string>(key, { defaultValue: key });
    if (typeof entry === 'string') {
      const defaultError = i18n.t<any, I18nErrorItem>(`ct.DEFAULT`);
      return new InternalServerErrorException(defaultError.msg + ` (${ex.code})`, {
        cause: ex,
      });
    }

    return this.#toHttpException(entry, ex.code, ex);
  }

  /**
   * Maps an Axios error to an HttpException.
   * @param error The Axios error.
   */
  map(error: AxiosError | PlatformException): HttpException {
    // If the error is an PlatformException, throw it.
    if (!(error instanceof AxiosError)) {
      throw error;
    }

    const baseURL = error.config?.baseURL ?? 'unknown CT HTTP server';

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
      return new InternalServerErrorException('CT API Error', { cause: sanitizeError(error) });
    }

    const defaultError = i18n.t<any, I18nErrorItem>(`ct.DEFAULT`);

    if (!error?.response) {
      return new InternalServerErrorException(defaultError.msg, { cause: sanitizeError(error) });
    }

    const ctError = error.response.data as CtError;
    if (!ctError) {
      return new InternalServerErrorException(defaultError.msg, { cause: sanitizeError(error) });
    }

    // Find the error code
    let code = isObject(ctError) ? ctError.error.errorCode : ctError?.split(':')[0];
    if (code.startsWith('<html')) {
      code = 'DEFAULT';
    }

    const key = `ct.${code}`;
    const entry = i18n.t<any, I18nErrorItem | string>(key, { defaultValue: key });

    if (typeof entry === 'string') {
      return new InternalServerErrorException(defaultError.msg + ` (${code})`, {
        cause: sanitizeError(error),
      });
    }

    return this.#toHttpException(entry, code, error);
  }

  #toHttpException(entry: I18nErrorItem, code: string, error: Error): HttpException {
    switch (entry?.status) {
      case 400:
        return new BadRequestException(entry?.msg + ` (${code})`, { cause: sanitizeError(error) });
      case 408:
        return new GatewayTimeoutException(entry?.msg + ` (${code})`, {
          cause: sanitizeError(error),
        });
      case 409:
        return new ConflictException(entry?.msg + ` (${code})`, { cause: sanitizeError(error) });
      case 502:
        return new BadGatewayException(entry?.msg + ` (${code})`, { cause: sanitizeError(error) });
      case 403:
      case 503:
        return new ServiceUnavailableException(entry?.msg + ` (${code})`, {
          cause: sanitizeError(error),
        });
      default:
        return new InternalServerErrorException(entry?.msg + ` (${code})`, {
          cause: sanitizeError(error),
        });
    }
  }
}
