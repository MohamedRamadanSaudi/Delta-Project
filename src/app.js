require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require("morgan");
const connectDB = require('./config/database');

const User = require('./routes/userRoutes');
const Otp = require('./routes/otpRoutes');

const app = express();

// Connect to Database
connectDB();

// Middlewares
app.use(morgan("dev"));
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/users', User);
app.use('/api/otp', Otp);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

process.on('unhandledRejection', err => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    server.close(() => {
      process.exit(1);
    });
  });
  
  process.on('SIGTERM', () => {
    console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
    server.close(() => {
      console.log('💥 Process terminated!');
    });
  });
  