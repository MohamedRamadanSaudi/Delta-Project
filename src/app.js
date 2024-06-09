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