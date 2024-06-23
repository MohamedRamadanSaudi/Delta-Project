const mongoose = require('mongoose');
const User = require('../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

// Function to check if an ID is valid
function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

exports.getCurrentUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate('addresses').populate('cart');

  if (!user) {
    return next(new AppError('No user found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find().populate('addresses');

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users
    }
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const id = req.params.id;

  if (!isValidObjectId(id)) {
    return next(new AppError('Invalid user ID', 400));
  }

  const user = await User.findById(id).populate('addresses').populate('cart');

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

exports.createUser = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      user: newUser
    }
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const id = req.params.id;

  if (!isValidObjectId(id)) {
    return next(new AppError('Invalid user ID', 400));
  }

  const user = await User.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true
  }).populate('addresses');

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const id = req.params.id;

  if (!isValidObjectId(id)) {
    return next(new AppError('Invalid user ID', 400));
  }

  const user = await User.findByIdAndDelete(id);

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'User deleted successfully'
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.confirm_password) {
    return next(new AppError('This route is not for password updates. Please use /updatePassword.', 400));
  }

  const filteredBody = {};
  const allowedFields = ['name', 'email', 'phone', 'anotherPhone'];
  Object.keys(req.body).forEach(el => {
    if (allowedFields.includes(el)) filteredBody[el] = req.body[el];
  });

  const userId = req.user._id;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return next(new AppError('Invalid user ID', 400));
  }

  const updatedUser = await User.findByIdAndUpdate(userId, filteredBody, {
    new: true,
    runValidators: true
  }).populate('addresses');

  if (!updatedUser) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});


exports.deleteMe = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  if (!isValidObjectId(userId)) {
    return next(new AppError('Invalid user ID', 400));
  }

  const user = await User.findByIdAndDelete(userId);

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});
