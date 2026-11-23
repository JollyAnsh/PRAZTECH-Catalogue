/**
 * Lightweight native cookie parser middleware (zero external dependencies)
 */
const cookieParser = (req, res, next) => {
  const cookieHeader = req.headers.cookie;
  req.cookies = {};
  if (cookieHeader) {
    cookieHeader.split(';').forEach(pair => {
      const idx = pair.indexOf('=');
      if (idx > 0) {
        const name = pair.slice(0, idx).trim();
        const value = pair.slice(idx + 1).trim();
        try {
          req.cookies[name] = decodeURIComponent(value);
        } catch {
          req.cookies[name] = value;
        }
      }
    });
  }
  next();
};

module.exports = cookieParser;
