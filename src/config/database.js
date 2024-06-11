const mongoose = require('mongoose');

require('dotenv').config();

const connectDB = async () => {
  try {
    const mongoURI = process.env.DATABASE_URL;
    const dbPassword = process.env.DATABASE_PASSWORD;

    if (!mongoURI) {
      throw new Error('DATABASE_URL is not defined in the environment variables');
    }

    if (!dbPassword) {
      throw new Error('DATABASE_PASSWORD is not defined in the environment variables');
    }

    const mongoURISecure = mongoURI.replace('<password>', dbPassword);

    await mongoose.connect(mongoURISecure);
    console.log('Database Connected Successfully...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
