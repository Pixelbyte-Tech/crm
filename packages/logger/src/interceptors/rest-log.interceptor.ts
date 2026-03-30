import { DateTime } from 'luxon';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { set, isObject } from 'lodash';
import { Request, Response } from 'express';
import { Logger, Injectable, CallHandler, NestInterceptor, ExecutionContext } from '@nestjs/common';

import { Env } from '@crm/utils';
import { isAuthenticatedReq } from '@crm/auth';

const IGNORED_PATHS = ['/status', '/docs'];

interface RequestSubjects {
  userId?: string;
  sessionId?: string;
}

@Injectable()
export class RestLogInterceptor<T extends Record<string, any>> implements NestInterceptor<T> {
  /** The logger instance */
  readonly #logger = new Logger(RestLogInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<Response> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    // Is this a request we want to ignore?
    for (const path of IGNORED_PATHS) {
      if (req.url.startsWith(path)) {
        return next.handle();
      }
    }

    const startTime = DateTime.utc();
    set(req, 'meta', { time: startTime.toISO() });

    const { userId, sessionId } = this.#getRequestSubjects(req);

    this.#logger.debug(this.#formatLogTitle(req, 'REQ', userId), {
      userId,
      sessionId,
      ip: req.ip,
      ...('params' in req ? { params: req['params'] } : {}),
      ...('query' in req ? { query: req['query'] } : {}),
      ...('body' in req ? { body: req['body'] } : {}),
    });

    return next.handle().pipe(
      map((response: any) => {
        // If the response is not JSON, return it as is
        if (!isObject(response)) {
          return response;
        }

        const result = { ...response, statusCode: res.statusCode };

        // Calculate the duration of the request
        if ('meta' in req && isObject(req.meta)) {
          const durationMs = DateTime.utc().diff(startTime).toMillis();
          set(result, 'meta', { ...req.meta, durationMs });
        }

        this.#logger.debug(
          this.#formatLogTitle(req, 'RES', userId),
          Env.isDev() ? { statusCode: res.statusCode } : result,
        );
        return result;
      }),
    );
  }

  /**
   * Formats the log title based on the request and account id
   * @param req  The request object
   * @param userId The id of the user making the request
   * @param type The type of log
   */
  #formatLogTitle = (req: Request, type: 'REQ' | 'RES', userId: string = '') => {
    return `${type} ${userId} ${req.method?.toUpperCase()} ${req.url}`;
  };

  /**
   * Retrieve the request subjects (the entity id in the authenticated request)
   * @param req The context request object
   */
  #getRequestSubjects(req: Request): RequestSubjects {
    if (false === isAuthenticatedReq(req)) {
      return {};
    }

    return {
      userId: req.user.userId,
      sessionId: req.user.sessionId,
    };
  }
}
