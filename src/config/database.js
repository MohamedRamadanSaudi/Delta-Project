const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.DATABASE_URL;
    if (!mongoURI) {
      throw new Error('DATABASE_URL is not defined in the environment variables');
    }
    await mongoose.connect(mongoURI);
    console.log('Database Connected Successfully...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
