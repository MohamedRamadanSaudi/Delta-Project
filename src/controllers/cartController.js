const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Get user cart
exports.getCart = catchAsync(async (req, res, next) => {
  const { _id: userId } = req.user;

  const cart = await Cart.findOne({ user: userId }).populate('items.product');
  if (!cart) {
    return next(new AppError('Cart not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      cart
    }
  });
});

// Add product to cart
exports.addToCart = catchAsync(async (req, res, next) => {
  const { productId, quantity } = req.body;
  const { _id: userId } = req.user;

  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }

  const itemIndex = cart.items.findIndex(item => item.product.equals(productId));
  if (itemIndex > -1) {
    cart.items[itemIndex].quantity += quantity;
  } else {
    cart.items.push({ product: productId, quantity });
  }

  await cart.save();

  res.status(200).json({
    status: 'success',
    data: {
      cart
    }
  });
});

// Remove product from cart
exports.removeFromCart = catchAsync(async (req, res, next) => {
  const { productId } = req.body;
  const { _id: userId } = req.user;

  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    return next(new AppError('Cart not found', 404));
  }

  const itemIndex = cart.items.findIndex(item => item.product.equals(productId));
  if (itemIndex > -1) {
    cart.items.splice(itemIndex, 1);
    await cart.save();
  }

  res.status(200).json({
    status: 'success',
    data: {
      cart
    }
  });
});
