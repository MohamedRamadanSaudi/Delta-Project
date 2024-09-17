const redisClient = require('../config/redis');

const cache = (duration) => {
  return async (req, res, next) => {
    if (redisClient.status !== 'ready') {
      return next();
    }

    let key = `__express__${req.originalUrl}`;

    // For paginated requests, include page and limit in the key
    if (req.query.page || req.query.limit) {
      key += `_page${req.query.page || 1}_limit${req.query.limit || 5}`;
    }

    try {
      const cachedResponse = await redisClient.get(key);
      if (cachedResponse) {
        return res.send(JSON.parse(cachedResponse));
      } else {
        res.sendResponse = res.send;
        res.send = (body) => {
          redisClient.setex(key, duration, JSON.stringify(body)).catch(err => {
            console.error('Redis setex error:', err);
          });
          res.sendResponse(body);
        };
        next();
      }
    } catch (error) {
      console.error('Redis error in cache middleware:', error);
      next();
    }
  };
};

module.exports = cache;