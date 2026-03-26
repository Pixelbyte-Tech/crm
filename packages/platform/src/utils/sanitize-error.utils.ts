import { has, unset } from 'lodash';

/**
 * Sanitises the error object to remove the bulk of useless information
 * which does not log well. Sensible information is obfuscated.
 * @param err The error to sanitise.
 */
export const sanitizeError = (err: Error): Error => {
  // These are props on `AxiosError` which we don't want to log. They
  // tend to be very large and not very useful.
  const props = [
    'request',
    'config',
    'response.headers',
    'response.config',
    'response.request',
    'options',
    'cause.config',
  ];
  for (const prop of props) {
    if (has(err, prop)) {
      unset(err, prop);
    }
  }

  return err;
};
