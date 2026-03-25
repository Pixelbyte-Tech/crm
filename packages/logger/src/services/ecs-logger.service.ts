import { has, unset } from 'lodash';
import { LoggerService } from '@nestjs/common';

const OBFUSCATED = ['securityPin', 'password'];

const LOG_SIZE_LIMIT = 500_000;

export class EcsLogger implements LoggerService {
  debug(message: unknown, ...optionalParams: unknown[]): void {
    const msg = this.toEcs(message, 'debug', optionalParams);
    if (msg) console.log(msg);
  }

  log(message: unknown, ...optionalParams: unknown[]): void {
    const msg = this.toEcs(message, 'info', optionalParams);
    if (msg) console.log(msg);
  }

  warn(message: unknown, ...optionalParams: unknown[]): void {
    const msg = this.toEcs(message, 'warn', optionalParams);
    if (msg) console.log(msg);
  }

  error(message: unknown, ...optionalParams: unknown[]): void {
    const msg = this.toEcs(message, 'error', optionalParams);
    if (msg) console.log(msg);
  }

  /**
   * Formats the message to be logged as a JSON string
   * suitable for parsing by the ElasticSearch ECS schema.
   */
  protected toEcs(message: unknown, level: string, optionalParams?: unknown[]): string | null {
    let context = 'n/a';
    let prop: object | undefined;
    let err: object | undefined;

    // The last parameter is the context.
    if (optionalParams && typeof optionalParams[optionalParams.length - 1] === 'string') {
      context = optionalParams.pop()?.toString() ?? 'n/a';
    }

    // Parse all optional parameters.
    for (const param of optionalParams || []) {
      // If the parameter is an error, set it as the error.
      if (param instanceof Error) {
        err = this.#sanitizeError(param);
        continue;
      }

      // If the parameter is an object, add it to the data.
      if (this.#isObject(param)) {
        for (const [key, value] of Object.entries(param)) {
          // If we find an error, set it as the error and remove it from the data.
          if (value instanceof Error) {
            err = this.#sanitizeError(value);
            delete param[key as keyof typeof param];
          }
        }

        prop = this.#obfuscate({ ...param }, 6);
      }
    }

    try {
      return this.#stringifyWithBigInt(this.#prepareLogParams(level, context, message, prop, err));
    } catch (err) {
      console.log(`Failed to stringify log message: ${err}`);
      return null;
    }
  }

  /**
   * Stringifies an object, replacing BigInt values with a string representation.
   * This is necessary because JSON does not support BigInt natively.
   * @param obj The object to stringify.
   */
  #stringifyWithBigInt(obj: object): string {
    return JSON.stringify(obj, (_, value) => (typeof value === 'bigint' ? `${value}n` : value));
  }

  /**
   * Prepares the log parameters for the log message.
   * @param level The log level.
   * @param context The context of the log message.
   * @param message The message to log.
   * @param prop The properties to log.
   * @param err The error to log.
   */
  #prepareLogParams(
    level: string,
    context: string,
    message: unknown,
    prop: unknown,
    err: unknown,
  ): Record<string, any> {
    // Prepare the log params
    let messageToLog = this.#isObject(message) ? this.#stringify(message) : message?.toString();
    let propToLog = this.#isObject(prop) ? this.#stringify(prop) : prop?.toString();
    let errToLog = this.#isObject(err) ? this.#stringify(err) : err?.toString();

    // Limit the log size
    if (messageToLog && messageToLog.length > LOG_SIZE_LIMIT) {
      messageToLog = messageToLog.substring(0, LOG_SIZE_LIMIT);
    }

    if (propToLog && propToLog.length > LOG_SIZE_LIMIT) {
      propToLog = propToLog.substring(0, LOG_SIZE_LIMIT);
    }

    if (errToLog && errToLog.length > LOG_SIZE_LIMIT) {
      errToLog = errToLog.substring(0, LOG_SIZE_LIMIT);
    }

    return {
      level,
      context,
      ...(messageToLog ? { message: messageToLog } : {}),
      ...(propToLog ? { prop: propToLog } : {}),
      ...(errToLog ? { err: errToLog } : {}),
    };
  }

  /**
   * Sanitizes the error object to remove the bulk of useless information
   * which does not log well. Sensible information is obfuscated.
   * @param err The error to sanitize.
   */
  #sanitizeError(err: Error): Error {
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
  }

  /**
   * Stringifies an object, replacing circular references with '[Circular]'.
   * @param obj The object to stringify.
   */
  #stringify(obj: object): string {
    const cache: object[] = [];

    const data = JSON.stringify(obj, (_, value) => {
      if (value && this.#isObject(value)) {
        // Circular-reference found, discard key
        if (cache.indexOf(value) !== -1) {
          return '[Circular]';
        }

        // Store value in our collection
        cache.push(value);
      }

      return this.#stringifyWithBigInt(value);
    });

    // Errors sometimes evaluate to '{}', so we need to handle that
    // in this weird way.
    if ('{}' === data) {
      return JSON.stringify(obj, Object.getOwnPropertyNames(obj))?.replace(/\s+/gm, ' ')?.replace(/\\n/gm, '');
    }

    return data?.replace(/\s+/gm, ' ')?.replace(/\\n/gm, '');
  }

  /**
   * Obfuscates the sensitive fields from the passed object or array.
   * @param data The data to obfuscate.
   * @param maxDepth The maximum object depth to obfuscate.
   * @param depth The current object depth.
   */
  #obfuscate<T extends object | unknown[] | string>(data: T, maxDepth: number = 0, depth: number = 0): T {
    if (Array.isArray(data)) {
      return this.#obfuscateArray(data, maxDepth, depth + 1) as T;
    }
    if (this.#isObject(data)) {
      return this.#obfuscateObject(data, maxDepth, depth + 1) as T;
    }

    return data;
  }

  /**
   * Obfuscates the sensitive fields from the passed object.
   * @param obj The object to obfuscate.
   * @param maxDepth The maximum object depth to obfuscate.
   * @param depth The current object depth.
   */
  #obfuscateObject(obj: object, maxDepth: number = 0, depth: number = 0): object {
    if (depth > maxDepth) {
      return obj;
    }

    const newObj: Record<string, any> = {};

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        newObj[key] = this.#obfuscateString(key, value);
      } else if (Array.isArray(value)) {
        newObj[key] = this.#obfuscateArray(value, maxDepth, depth + 1);
      } else if (this.#isObject(value)) {
        newObj[key] = this.#obfuscateObject(value, maxDepth, depth + 1);
      } else {
        newObj[key] = value;
      }
    }
    return newObj;
  }

  /**
   * Obfuscates the sensitive fields from the passed array.
   * @param arr The array to obfuscate.
   * @param maxDepth The maximum object depth to obfuscate.
   * @param depth The current object depth.
   */
  #obfuscateArray(arr: unknown[], maxDepth: number = 0, depth: number = 0): unknown[] {
    const newObj: unknown[] = [];

    for (const value of arr) {
      if (Array.isArray(value)) {
        newObj.push(this.#obfuscateArray(value, maxDepth, depth + 1));
      } else if (this.#isObject(value)) {
        newObj.push(this.#obfuscateObject(value, maxDepth, depth + 1));
      } else {
        newObj.push(value);
      }
    }
    return newObj;
  }

  /**
   * Obfuscates the passed string.
   * @param key The key of the string.
   * @param str The string to obfuscate.
   */
  #obfuscateString(key: string, str: string): string | Record<string, any> {
    if (OBFUSCATED.includes(key)) {
      return `${str.slice(0, 2)}****${str.slice(-2)}`;
    }

    for (const obfuscated of OBFUSCATED) {
      const match = new RegExp(`${obfuscated}=([^&"]*)`, 'gm').exec(str);
      if (match) {
        str = str.replace(match[1], `${match[1].slice(0, 2)}****${match[1].slice(-2)}`);
      }
    }

    try {
      // Check if the string is a stringified object.
      const obj = JSON.parse(str);
      if (this.#isObject(obj)) {
        return this.#obfuscateObject(obj, 2, 0);
      }
      if (Array.isArray(obj)) {
        return this.#obfuscateArray(obj, 2, 0);
      }
    } catch {}

    return str;
  }

  /**
   * Returns true if the passed parameter is an object.
   * @param obj The item to test.
   */
  #isObject(obj: unknown): obj is object {
    return 'object' === typeof obj && !Array.isArray(obj) && obj !== null && 'string' !== typeof obj;
  }
}
