const crypto = require('crypto');
const User = require('../models/userModel');
const sendEmail = require('../utils/email');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.sendOTP = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError('There is no user with that email address.', 404));
  }

  const otp = user.generateOTP();

  await sendEmail({
    email: email,
    name: user.name,
    otp: otp,
    template: 'signup-email',
    subject: 'Your OTP Code'
  });

  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    message: 'OTP sent to email',
  });
});

exports.verifyOTP = catchAsync(async (req, res, next) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError('User not found', 400));
  }

  const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

  if (!user.otp || user.otpExpires < Date.now()) {
    return next(new AppError('OTP has expired', 400));
  }

  if (user.otp !== hashedOTP) {
    return next(new AppError('Invalid OTP', 400));
  }

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    message: 'Email verified successfully',
  });
});
