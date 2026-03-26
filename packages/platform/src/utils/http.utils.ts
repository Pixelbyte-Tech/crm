import { AxiosError } from 'axios';
import { HttpStatus } from '@nestjs/common';

/**
 * Returns true if the status code is 200, 206, 202, 204, or 201.
 * @param status {unknown} The status code to check.
 */
export const isOk = (status: string | number) => {
  const parsed = Number(status);

  return (
    parsed === HttpStatus.OK ||
    parsed === HttpStatus.PARTIAL_CONTENT ||
    parsed === HttpStatus.ACCEPTED ||
    parsed === HttpStatus.NO_CONTENT ||
    parsed === HttpStatus.CREATED
  );
};

/**
 * Checks for an unavailable remove web server after and http call was made to it
 * unavailable remove web server would be a server that returns either of the following statuses
 * 502 -> Bad Gateway
 * 504 -> Gateway timeout
 * 503 -> Service Unavailable
 * @see https://en.wikipedia.org/wiki/List_of_HTTP_status_codes
 * @param err {AxiosError} The axios error object thrown by the request to the remote server
 * @returns A boolean indicating whether the server was available or not
 */
export const isUnavailable = (err: AxiosError): boolean => {
  const parsed = Number(err?.status);

  const isUnavailable = [
    HttpStatus.BAD_GATEWAY,
    HttpStatus.REQUEST_TIMEOUT,
    HttpStatus.GATEWAY_TIMEOUT,
    HttpStatus.SERVICE_UNAVAILABLE,
  ].includes(parsed);

  if (isUnavailable) {
    return true;
  }

  return err.code === 'ECONNABORTED';
};
