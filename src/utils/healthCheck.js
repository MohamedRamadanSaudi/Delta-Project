const mongoose = require('mongoose');

const healthCheck = async (req, res) => {
  try {
    // Check database connection
    const isDbConnected = mongoose.connection.readyState === 1;

    // Check Redis connection
    let isRedisConnected = false;
    try {
      await req.redisClient.ping();
      isRedisConnected = true;
    } catch (redisError) {
      console.error('Redis health check failed:', redisError);
    }

    if (isDbConnected && isRedisConnected) {
      res.status(200).json({
        status: 'UP',
        database: 'Connected',
        redis: 'Connected'
      });
    } else {
      res.status(503).json({
        status: 'DOWN',
        database: isDbConnected ? 'Connected' : 'Disconnected',
        redis: isRedisConnected ? 'Connected' : 'Disconnected'
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: error.message
    });
  }
};

module.exports = healthCheck;
