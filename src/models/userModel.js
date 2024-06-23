const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name']
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Please provide your phone number'],
    unique: true,
    validate: [validator.isMobilePhone, 'Please provide a valid phone number']
  },
  anotherPhone: {
    type: String,
    validate: {
      validator: function(value) {
        return value === null || value === '' || validator.isMobilePhone(value);
      },
      message: 'Please provide a valid phone number'
    }
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  password: {
    type: String,
    minlength: 8,
    validate: {
      validator: function(value) {
        return /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/.test(value);
      },
      message: 'Password must have at least one capital letter, one number, and be at least 8 characters long'
    },
    select: false
  },
  confirm_password: {
    type: String,
    validate: {
      validator: function(el) {
        return el === this.password;
      },
      message: 'Passwords are not the same!'
    }
  },
  addresses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Address'
    }
  ],
  deviceToken: {
    type: String,
  },
  cart: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cart'
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  otp: String,
  otpExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  }
});

UserSchema.pre('save', async function(next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete confirm_password field
  this.confirm_password = undefined;
  next();
});

UserSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

UserSchema.pre(/^find/, function(next) {
  // this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

UserSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

UserSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

    return JWTTimestamp < changedTimestamp;
  }
  // False means NOT changed
  return false;
};

UserSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// Generate OTP and set expiry time
UserSchema.methods.generateOTP = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = crypto.createHash('sha256').update(otp).digest('hex');
  this.otpExpires = Date.now() + 2 * 60 * 1000; // OTP expires in 2 minutes
  return otp;
};

module.exports = mongoose.model('User', UserSchema);
