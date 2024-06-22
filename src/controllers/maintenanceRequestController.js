const mongoose = require('mongoose');
const MaintenanceRequest = require('../models/maintenanceRequestModel');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Create a maintenance request
exports.createMaintenanceRequest = catchAsync(async (req, res, next) => {
    const { type, address, description, date, time } = req.body;
    const { _id: userId } = req.user;

    try {
      // Check if the user already has an active request
      const existingRequest = await MaintenanceRequest.findOne({
        user: userId,
        status: 'pending'
      });
  
      if (existingRequest) {
        return next(new AppError('You already have an active maintenance request', 400));
      }
  
      // Create new maintenance request
      const newRequest = await MaintenanceRequest.create({
        type,
        address,
        description,
        date,
        time,
        user: userId
      });
  
      res.status(201).json({
        status: 'success',
        data: {
          request: newRequest
        }
      });
    } catch (error) {
      return next(new AppError(error.message, 500));
    }
  });

// Get all normal maintenance requests
exports.getAllNormalRequests = catchAsync(async (req, res, next) => {
  const normalRequests = await MaintenanceRequest.find({ type: 'normal' }).populate('user').populate('address');

  res.status(200).json({
    status: 'success',
    results: normalRequests.length,
    data: {
      requests: normalRequests
    }
  });
});

// Get all urgent maintenance requests
exports.getAllUrgentRequests = catchAsync(async (req, res, next) => {
  const urgentRequests = await MaintenanceRequest.find({ type: 'urgent' }).populate('user').populate('address');

  res.status(200).json({
    status: 'success',
    results: urgentRequests.length,
    data: {
      requests: urgentRequests
    }
  });
});

// Get a single maintenance request by ID
exports.getMaintenanceRequestById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const request = await MaintenanceRequest.findById(id).populate('user').populate('address');

  if (!request) {
    return next(new AppError('Maintenance request not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      request
    }
  });
});

// Delete a maintenance request by ID
exports.deleteMaintenanceRequest = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const request = await MaintenanceRequest.findByIdAndDelete(id);

  if (!request) {
    return next(new AppError('Maintenance request not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});
