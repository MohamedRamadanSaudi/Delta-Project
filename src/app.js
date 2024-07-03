require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const morgan = require("morgan");
const connectDB = require('./config/database');
const AppError = require('./utils/appError');
const errorHandler = require('./middlewares/errorHandler');
const rateLimit = require('express-rate-limit');

const User = require('./routes/userRoutes');
const Otp = require('./routes/otpRoutes');
const Complaint = require('./routes/complaintRoutes');
const Address = require('./routes/addressRoutes');
const ProductCategory = require('./routes/productCategoryRoutes');
const Product = require('./routes/productRoutes');
const MaintenanceRequest = require('./routes/maintenanceRequestRoutes');
const Notifications = require('./routes/notificationRoutes');
const Cart = require('./routes/cartRoutes');
const Order = require('./routes/orderRoutes');
const Pdf = require('./routes/pdfRoutes');

const app = express();

// Connect to Database
connectDB();

// // Limit requests from same API
// const limiter = rateLimit({
//   max: 100,
//   windowMs: 60 * 60 * 1000,
//   message: 'Too many requests from this IP, please try again in an hour!'
// });
// app.use('/api', limiter);

// Middlewares
app.use(cookieParser());
app.use(morgan("dev"));
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/users', User);
app.use('/api/otp', Otp);
app.use('/api/complaints', Complaint);
app.use('/api/addresses', Address);
app.use('/api/product-categories', ProductCategory);
app.use('/api/products', Product);
app.use('/api/maintenance-requests', MaintenanceRequest);
app.use('/api/notifications', Notifications);
app.use('/api/carts', Cart);
app.use('/api/orders', Order);
app.use('/api/pdf', Pdf);

// Catch-all route handler for undefined routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handling middleware
app.use(errorHandler);

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
  