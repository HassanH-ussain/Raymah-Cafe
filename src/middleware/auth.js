const jwt = require('jsonwebtoken');

/**
 * requireAuth — Express middleware that verifies a JWT from the
 * `Authorization: Bearer <token>` header.
 * Sets `req.user = { sub: userId }` on success.
 */
module.exports = function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  const token = header.slice(7);
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};
