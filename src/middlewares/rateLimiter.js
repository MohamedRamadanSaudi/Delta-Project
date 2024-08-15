const rateLimit = require('express-rate-limit');

// Rate limiter middleware for non-admin users
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, // 1 hour
  message: 'Too many requests from this IP, please try again in an hour!'
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
