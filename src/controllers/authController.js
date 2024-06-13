const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Blacklist = require('../models/blacklistModel');
const catchAsync = require('./../utils/catchAsync.js');
const AppError = require('../utils/appError.js');
const sendEmail = require('./../utils/email.js');
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
    subject: 'Your OTP Code',
    message: `Your OTP is ${otp}`,
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

  await user.save();

  createSendToken(user, 200, req, res);
});

exports.login = catchAsync(async function (req, res, next) {
  const { phone, password } = req.body;

  // 1) Check if phone and password exist
  if (!phone || !password) {
    return next(new AppError('Please provide phone and password!', 400));
  }
  // 2) Check if user exists && password is correct
  const user = await User.findOne({ phone: phone  }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
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


exports.logout = catchAsync(async (req, res) => {
  const token = req.cookies.jwt;

  if (!token) {
    return res.status(400).json({ message: 'No Token Provided' });
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const expiresAt = new Date(decoded.exp * 1000);

  await Blacklist.create({ token, expiresAt });

  res.clearCookie('jwt', {
    httpOnly: true,
    secure: true,
  });

  res.sendStatus(204); // No Content
});


exports.isLoggedIn = catchAsync(async function (req, res, next) {
  if (req.cookies.jwt) {
    try {
      const token = req.cookies.jwt;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if the token is blacklisted
      const blacklistedToken = await Blacklist.findOne({ token });
      if (blacklistedToken) {
        return next(new AppError('Token is blacklisted', 401));
      }

      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      req.user = currentUser;
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
});

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

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get('host')}/api/users/resetPassword/${resetToken}`;
  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    console.log('Sending password reset email to:', user.email);

    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message: message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    console.error('Error sending email:', err);

    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('There was an error sending the email. Try again later!', 500));
  }
});



exports.resetPassword = catchAsync(async function (req, res, next) {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  user.password = req.body.password;
  user.confirm_password = req.body.confirm_password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.status(200).json({
    status: 'success',
    token,
  });
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
