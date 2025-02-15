require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const morgan = require("morgan");
const connectDB = require('./config/database');
const AppError = require('./utils/appError');
const errorHandler = require('./middlewares/errorHandler');
const rateLimiter = require('./middlewares/rateLimiter');
const HealthCheck = require('./utils/healthCheck');

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
const orderContract = require('./routes/orderContractRoutes');
const maintenanceContract = require('./routes/maintenanceContractRoutes');
const Slider = require('./routes/sliderRoutes');
const Sells = require('./routes/sellsRoutes');
const { default: mongoose } = require('mongoose');

const app = express();

// Connect to Database
connectDB();

// Middlewares
app.use(cookieParser());
app.use(morgan("dev"));
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
// Apply rate limiting for non-admin users
app.set('trust proxy', 1)
app.use('/api', rateLimiter);

// Routes
app.use('/api/health', HealthCheck);
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
app.use('/api/order-contract', orderContract);
app.use('/api/maintenance-contract', maintenanceContract);
app.use('/api/slider', Slider);
app.use('/api/sells', Sells);

// Catch-all route handler for undefined routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
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
