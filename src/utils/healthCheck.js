const mongoose = require('mongoose');

const healthCheck = async (req, res) => {
  try {
    // Check database connection
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      res.status(200).json({
        status: 'UP',
        database: 'Connected',
      });
    } else {
      res.status(503).json({
        status: 'DOWN',
        database: isDbConnected ? 'Connected' : 'Disconnected',
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
