const Sells = require('../models/sellsModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Create a new sell record
exports.createSell = catchAsync(async (req, res, next) => {
  const newSell = await Sells.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      sell: newSell
    }
  });
});

// Get all sell records
exports.getAllSells = catchAsync(async (req, res, next) => {
  const sells = await Sells.find();
  res.status(200).json({
    status: 'success',
    results: sells.length,
    data: {
      sells
    }
  });
});

// Get a single sell record by ID
exports.getSell = catchAsync(async (req, res, next) => {
  const sell = await Sells.findById(req.params.id);
  if (!sell) {
    return next(new AppError('No sell found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      sell
    }
  });
});

// Update a sell record
exports.updateSell = catchAsync(async (req, res, next) => {
  const sell = await Sells.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!sell) {
    return next(new AppError('No sell found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      sell
    }
  });
});

// Delete a sell record
exports.deleteSell = catchAsync(async (req, res, next) => {
  const sell = await Sells.findByIdAndDelete(req.params.id);
  if (!sell) {
    return next(new AppError('No sell found with that ID', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null
  });
});