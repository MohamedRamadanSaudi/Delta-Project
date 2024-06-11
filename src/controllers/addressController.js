const Address = require('../models/addressModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const mongoose = require('mongoose');

// Function to check if an ID is valid
function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

exports.createAddress = catchAsync(async (req, res, next) => {
  const { city, area, street, building, flat, latitude, longitude } = req.body;

  if (!city || !area || !street || !building || !flat || !latitude || !longitude) {
    return next(new AppError('Please provide all address details', 400));
  }

  const address = await Address.create({
    city,
    area,
    street,
    building,
    flat,
    latitude,
    longitude,
    user: req.user._id
  });

  req.user.addresses.push(address._id);
  await req.user.save();

  res.status(201).json({
    status: 'success',
    data: {
      address
    }
  });
});

exports.getAddresses = catchAsync(async (req, res, next) => {
  const addresses = await Address.find({ user: req.user._id });

  res.status(200).json({
    status: 'success',
    data: {
      addresses
    }
  });
});

exports.updateAddress = catchAsync(async (req, res, next) => {
  const addressId = req.params.id;

  if (!isValidObjectId(addressId)) {
    return next(new AppError('Invalid address ID', 400));
  }

  const updatedAddress = await Address.findByIdAndUpdate(addressId, req.body, {
    new: true,
    runValidators: true
  });

  if (!updatedAddress) {
    return next(new AppError('No address found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      address: updatedAddress
    }
  });
});

exports.deleteAddress = catchAsync(async (req, res, next) => {
  const address = await Address.findByIdAndDelete(req.params.id);

  if (!address) {
    return next(new AppError('No address found with that ID', 404));
  }

  req.user.addresses.pull(address._id);
  await req.user.save();

  res.status(204).json({
    status: 'success',
    data: null
  });
});
