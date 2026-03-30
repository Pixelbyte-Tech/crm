const jwt = require('jsonwebtoken');

function getBearerToken(req) {
  const header = req.headers.authorization || req.headers.Authorization;
  if (!header) return null;

  const [type, token] = header.split(' ');
  if (type !== 'Bearer' || !token) return null;

  return token;
}

function getSecurityContext(req) {
  const token = getBearerToken(req);
  if (!token) {
    const err = new Error('Unauthorized: Missing Bearer token');
    err.status = 401;
    throw err;
  }

  if (!process.env.CUBEJS_API_SECRET) {
    const err = new Error('Server misconfigured: CUBEJS_API_SECRET is not set');
    err.status = 500;
    throw err;
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.CUBEJS_API_SECRET);
  } catch {
    const err = new Error('Unauthorized: Invalid token');
    err.status = 401;
    throw err;
  }

  return {
    security_context: {
      userId: String(payload.userId),
      sessionId: String(payload.sessionId),
      role: String(payload.role),
    },
  };
}

module.exports = {
  /**
   * Runs on every request.
   * @param req The request object
   */
  checkAuth: (req) => {
    return getSecurityContext(req);
  },

  /**
   * Runs on every SQL API request.
   * @param req The request object
   */
  checkSqlAuth: (req) => {
    return getSecurityContext(req);
  },

  /**
   * Rewrites the query to enforce security context
   * @param query The query object
   * @param securityContext The security context
   */
  queryRewrite: (query, { securityContext }) => {
    // No restrictions for the admin role
    if (securityContext?.role === 'super_admin') {
      return query;
    }

    if (securityContext?.userId) {
      query.filters = query.filters || [];
      query.filters.push({
        member: 'user.id',
        operator: 'equals',
        values: [securityContext.userId],
      });
    }
    return query;
  },
};
