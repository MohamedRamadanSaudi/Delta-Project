const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('./../utils/catchAsync.js');
const AppError = require('../utils/appError.js');
const sendEmail = require('./../utils/email.js');
const path = require('path');
require('dotenv').config();

function signToken(id) {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
}

function createSendToken(user, statusCode, req, res) {
  const token = signToken(user._id);

  res.cookie('jwt', token, {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true, // cookie cannot be accessed or modified in any way by the browser
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
  });

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token: token,
    data: {
      user: user
    }
  });
}

exports.signup = catchAsync(async function (req, res, next) {
  const { name, email, phone, role } = req.body;

  // Validate input fields
  if (!name || !email || !phone) {
    return next(new AppError('Please provide all required fields', 400));
  }

  // Check if user already exists
  const user = await User.findOne({ email });
  
  if (user) {
    return next(new AppError('User already exists', 400));
  }

  // Create user
  const newUser = await User.create({
    name,
    email,
    phone,
    role
  });

  // Generate OTP and send it
  const otp = newUser.generateOTP();
  await newUser.save({ validateBeforeSave: false });

  console.log('Sending OTP email to:', email);

  await sendEmail({
    email: email,
    subject: 'Your OTP Code for Account Verification at Delta',
    message: `Your OTP code for Account Verification is: \n\n ${otp} \n\n It is valid for 1 minute.`,
  });

  res.status(200).json({
    status: 'success',
    message: 'OTP sent to email!',
  });
});

exports.setPasswordAfterOTP = catchAsync(async (req, res, next) => {
  const { email, password, confirm_password } = req.body;

  // Validate input fields
  if (!email || !password || !confirm_password) {
    return next(new AppError('Please provide all required fields', 400));
  }

  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError('User not found', 400));
  }

  user.password = password;
  user.confirm_password = confirm_password;
  user.isPasswordSet = true;

  await user.save();

  createSendToken(user, 200, req, res);
});

exports.login = catchAsync(async function (req, res, next) {
  const { phone, password } = req.body;

  // 1) Check if phone and password exist
  if (!phone || !password) {
    return next(new AppError('Please provide phone and password!', 400));
  }
  // 2) Check if user exists && verified && password has been set && password is correct
  const user = await User.findOne({ phone: phone  }).select('+password');

  if (!user) {
    return next(new AppError('Incorrect phone or password', 401));
  }
  
  if (!user.isVerified) {
    return next(new AppError('Your account is not verified. Please verify your account to log in.', 403));
  }

  if (!user.isPasswordSet) {
    return next(new AppError('You have not set a password. Please set a password to log in.', 403));
  }

  if (!(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect phone or password', 401));
  }

  // 3) If everything ok, send token to client
  createSendToken(user, 200, req, res);
});

exports.adminLogin = catchAsync(async function (req, res, next) {
  const { phone, password } = req.body;

  // 1) Check if phone and password exist
  if (!phone || !password) {
    return next(new AppError('Please provide phone and password!', 400));
  }

  // 2) Check if user exists && password is correct
  const user = await User.findOne({ phone: phone }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect phone or password', 401));
  }

  // 3) Check if user has admin role
  if (user.role !== 'admin') {
    return next(new AppError('You do not have permission to access this route', 403));
  }

  // 4) If everything ok, send token to client
  createSendToken(user, 200, req, res);
});


exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000), // Token expires in 10 seconds
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    path: '/'
  });
  res.status(200).json({ status: 'success' });
};

exports.restrictTo = function (...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async function (req, res, next) {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with that email address.', 404));
  }

  // Generate OTP and set expiry time
  const otp = user.generateOTP();
  await user.save({ validateBeforeSave: false });

  // Send OTP to email
  const message = `Your OTP code for Password Reset is: \n\n ${otp} \n\n It is valid for 1 minute. \n\n If you have not requested this, please ignore this email.`;

  try {
    console.log('Sending OTP email to:', user.email);

    await sendEmail({
      email: user.email,
      subject: 'Your OTP Code for Password Reset',
      message: message,
    });

    res.status(200).json({
      status: 'success',
      message: 'OTP sent to email!',
    });
  } catch (err) {
    console.error('Error sending email:', err);

    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('There was an error sending the email. Try again later!', 500));
  }
});



exports.resetPassword = catchAsync(async (req, res, next) => {
  const { email, password, confirm_password } = req.body;

  if (!email || !password || !confirm_password) {
    return next(new AppError('Please provide all required fields', 400));
  }

  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  user.password = password;
  user.confirm_password = confirm_password;

  await user.save();

  createSendToken(user, 200, req, res);
});

exports.updatePassword = catchAsync(async function (req, res, next) {
  const user = await User.findById(req.user._id).select('+password'); 

  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  user.password = req.body.password;
  user.confirm_password = req.body.confirm_password;
  await user.save();

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.status(200).json({
    status: 'success',
    token,
  });
});
