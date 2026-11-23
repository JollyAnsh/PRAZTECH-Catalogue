const express = require('express');
const router = express.Router();
const { loginLimiter } = require('../middleware/rateLimiter');
const { requireAdminAuth } = require('../middleware/auth');
const {
  verifyPassword,
  signSessionToken,
  COOKIE_NAME,
  getCookieOptions
} = require('../utils/security');

/**
 * POST /api/auth/login
 * Validates administrative credentials, sets HTTP-only session cookie and returns token
 */
router.post('/login', loginLimiter, (req, res) => {
  const { password } = req.body || {};

  if (!password || typeof password !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Password is required.'
    });
  }

  // Check against hashed password if configured, or plaintext env variable
  const targetSecret = process.env.ADMIN_PASSWORD_HASH || process.env.ADMIN_PASSWORD;

  if (!targetSecret) {
    return res.status(500).json({
      success: false,
      message: 'Server security configuration error: Administrative credentials are not configured in environment.'
    });
  }

  const isValid = verifyPassword(password, targetSecret);

  if (!isValid) {
    return res.status(401).json({
      success: false,
      message: 'Invalid administrative credentials.'
    });
  }

  // Generate 8-hour session token
  const token = signSessionToken({ role: 'admin' }, 8 * 3600);

  // Set HTTP-only secure session cookie
  res.cookie(COOKIE_NAME, token, getCookieOptions());

  return res.json({
    success: true,
    message: 'Administrative authentication successful.',
    token,
    user: {
      role: 'admin'
    }
  });
});

/**
 * POST /api/auth/logout
 * Invalidates the administrative session cookie
 */
router.post('/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME, getCookieOptions());
  return res.json({
    success: true,
    message: 'Logged out successfully.'
  });
});

/**
 * GET /api/auth/me
 * Verifies if the incoming request has a valid administrative session
 */
router.get('/me', requireAdminAuth, (req, res) => {
  return res.json({
    success: true,
    authenticated: true,
    role: req.user?.role || 'admin',
    user: req.user
  });
});

module.exports = router;
