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
  map(error: AxiosError | PlatformException): HttpException {
    // If the error is an PlatformException, throw it.
    if (!(error instanceof AxiosError)) {
      throw error;
    }

    const baseURL = error.config?.baseURL ?? 'unknown TL server';

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
      const tlError = error?.response ? (error.response.data as TlError) : null;
      return new InternalServerErrorException(tlError ? `TL API Error - ${tlError?.statusCode}` : `TL API Error`, {
        cause: sanitizeError(error),
        description: `RequestId: ${tlError?.requestId}`,
      });
    }

    const defaultError = i18n.t<any, I18nErrorItem>(`tl.DEFAULT`);

    if (!error?.response) {
      return new InternalServerErrorException(defaultError.msg, { cause: sanitizeError(error) });
    }

    const tlError = error.response.data as TlError;
    if (!tlError) {
      return new InternalServerErrorException(defaultError.msg, { cause: sanitizeError(error) });
    }

    const code = tlError.status;

    const key = `tl.${code}`;
    const entry = i18n.t<any, I18nErrorItem | string>(key, { defaultValue: key });

    if (typeof entry === 'string') {
      return new InternalServerErrorException(defaultError.msg, {
        cause: sanitizeError(error),
        description: `${tlError.message}. RequestId: ${tlError.requestId}`,
      });
    }

    switch (entry?.status ?? error.response.status) {
      case 400:
        return new BadRequestException(entry.msg, {
          cause: sanitizeError(error),
          description: `${tlError.message}. RequestId: ${tlError.requestId}`,
        });
      case 408:
        return new GatewayTimeoutException(entry.msg, {
          cause: sanitizeError(error),
          description: `${tlError.message}. RequestId: ${tlError.requestId}`,
        });
      case 409:
        return new ConflictException(entry.msg, {
          cause: sanitizeError(error),
          description: `${tlError.message}. RequestId: ${tlError.requestId}`,
        });
      case 502:
        return new BadGatewayException(entry.msg, {
          cause: sanitizeError(error),
          description: `${tlError.message}. RequestId: ${tlError.requestId}`,
        });
      case 403:
      case 503:
        return new ServiceUnavailableException(entry.msg, {
          cause: sanitizeError(error),
          description: `${tlError.message}. RequestId: ${tlError.requestId}`,
        });
      default:
        return new ServiceUnavailableException(entry.msg, {
          cause: sanitizeError(error),
          description: `${tlError.message}. RequestId: ${tlError.requestId}`,
        });
    }
  }
}
