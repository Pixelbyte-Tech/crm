import { AuthenticatedReq } from '../types';

export function isAuthenticatedReq(req: unknown): req is AuthenticatedReq {
  return (
    undefined !== req &&
    null !== req &&
    'object' === typeof req &&
    'user' in req &&
    ['id', 'userId', 'sessionId'].every((prop) => 'object' === typeof req['user'] && req.user && prop in req.user)
  );
}
