const { verifySessionToken, COOKIE_NAME } = require('../utils/security');

/**
 * Validates administrative authentication via:
 * 1. HTTP-only signed session cookie
 * 2. Authorization Bearer header
 * 3. Administrative API Key (x-admin-key header or query param)
 */
const requireAdminAuth = (req, res, next) => {
  // 1. Check HTTP-only cookie
  let token = req.cookies ? req.cookies[COOKIE_NAME] : null;

  // 2. Check Authorization Bearer header
  if (!token && req.headers && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.slice(7).trim();
  }

  // 3. Verify session token if provided
  if (token) {
    const payload = verifySessionToken(token);
    if (payload) {
      req.user = payload;
      return next();
    }
  }

  // 4. Verify administrative API key header (if configured in environment)
  const expectedKey = process.env.ADMIN_API_KEY;
  if (expectedKey) {
    const queryParams = req.query || {};
    const providedKey = (req.headers && req.headers['x-admin-key']) || queryParams.admin_key || queryParams.key || queryParams.apiKey;

    if (providedKey && typeof providedKey === 'string' && providedKey === expectedKey) {
      req.user = { role: 'admin', authMethod: 'api-key' };
      return next();
    }
  }

  return res.status(401).json({
    success: false,
    message: 'Unauthorized: Valid administrative session or API key required.'
  });
};

/**
 * Backward compatibility alias for export scripts
 */
const requireAdminKey = (req, res, next) => {
  return requireAdminAuth(req, res, next);
};

module.exports = { requireAdminAuth, requireAdminKey };
