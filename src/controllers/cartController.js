const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Get user cart
exports.getCart = catchAsync(async (req, res, next) => {
  const { _id: userId } = req.user;

  const cart = await Cart.findOne({ user: userId })
    .populate({
      path: 'items.product',
      populate: {
        path: 'category'
      }
    });
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

  // Check if the product exists in the database
  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  // Find the user's cart
  let cart = await Cart.findOne({ user: userId });

  // If the cart doesn't exist, create a new cart for the user
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }

  // Check if the product is already in the cart
  const itemIndex = cart.items.findIndex(item => item.product.equals(productId));
  if (itemIndex > -1) {
    // If the product is already in the cart, return a message
    return res.status(400).json({
      status: 'fail',
      message: 'Product is already in the cart'
    });
  } else {
    // If the product is not in the cart, add it
    cart.items.push({ product: productId, quantity });
  }

  // Save the cart
  await cart.save();

  // Respond with the updated cart
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
