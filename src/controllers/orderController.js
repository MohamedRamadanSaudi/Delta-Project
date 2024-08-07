const mongoose = require('mongoose');
const Order = require('../models/orderModel');
const Address = require('../models/addressModel');
const Cart = require('../models/cartModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Create an order
exports.createOrder = catchAsync(async (req, res, next) => {
  const { address, name, phone } = req.body;
  const userId = req.user._id;

  // Find the user's cart
  const cart = await Cart.findOne({ user: userId }).populate('items.product');

  if (!cart) {
    return next(new AppError('Cart is empty', 400));
  }

  // Create order
  const order = await Order.create({
    user: userId,
    name: name || req.user.name,
    phone: phone || req.user.phone,
    address,
    cartItems: cart.items // Store cart items directly in the order
  });

  // Clear the cart
  await Cart.findOneAndDelete({ user: userId });

  res.status(201).json({
    status: 'success',
    data: {
      order
    }
  });
});

// Get a user's orders
exports.getUserOrders = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  const orders = await Order.find({ user: userId }).populate({
    path: 'cartItems.product'
  }).populate('address');

  res.status(200).json({
    status: 'success',
    results: orders.length,
    data: {
      orders
    }
  });
});

// Get all orders (admin)
exports.getAllOrders = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const skip = (page - 1) * limit;

  const orders = await Order.find()
    .populate('user')
    .populate('address')
    .populate({
      path: 'cartItems.product'
    })
    .skip(skip)
    .limit(limit);
  const total = await Order.countDocuments();

  res.status(200).json({
    status: 'success',
    results: orders.length,
    data: {
      orders,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    }
  });
});

// Get order by ID (admin)
exports.getOrderById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid order ID', 400));
  }

  const order = await Order.findById(id)
    .populate('user')
    .populate('address')
    .populate({
      path: 'cartItems.product'
    });

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      order
    }
  });
});

// Update order (admin)
exports.updateOrder = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updates = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid order ID', 400));
  }

  const order = await Order.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true
  }).populate('user').populate({
    path: 'address'
  }).populate({
    path: 'cartItems.product'
  });

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  if (updates.contractStages === 'Signature') {
    await mongoose.model('User').findByIdAndUpdate(order.user, { isUserHasContract: true });
  }

  res.status(200).json({
    status: 'success',
    data: {
      order
    }
  });
});

// Delete order (admin)
exports.deleteOrder = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid order ID', 400));
  }

  const order = await Order.findByIdAndDelete(id);

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});
