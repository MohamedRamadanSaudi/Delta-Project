const rateLimit = require('express-rate-limit');

// Rate limiter middleware for non-admin users
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: 'draft-7',
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const rateLimiter = (req, res, next) => {
  // Assuming req.user contains user information and has a role property
  if (req.user && req.user.role === 'admin') {
    // Skip rate limiting for admins
    return next();
  }

  // Apply rate limiter for non-admin users
  return limiter(req, res, next);
};

module.exports = rateLimiter;
