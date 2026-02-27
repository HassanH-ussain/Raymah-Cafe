/**
 * adminAuth — checks the x-admin-key header against ADMIN_KEY env var.
 * Returns 401 if the key is missing or wrong.
 */
const adminAuth = (req, res, next) => {
  const key = req.headers['x-admin-key'];

  if (!process.env.ADMIN_KEY) {
    // Fail closed: if no key is configured, block all admin access
    return res.status(503).json({ success: false, message: 'Admin access not configured' });
  }

  if (!key || key !== process.env.ADMIN_KEY) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  next();
};

module.exports = adminAuth;
