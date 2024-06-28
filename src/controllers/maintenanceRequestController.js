const mongoose = require('mongoose');
const MaintenanceRequest = require('../models/maintenanceRequestModel');
const Order = require('../models/orderModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Create a maintenance request
exports.createMaintenanceRequest = catchAsync(async (req, res, next) => {
  const { type, address, description, date, time } = req.body;
  const { _id: userId } = req.user;

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
});

// Helper function to enhance requests with order info
const enhanceRequestsWithOrderInfo = async (requests) => {
  return await Promise.all(
    requests.map(async (request) => {
      const userOrders = await Order.find({ user: request.user._id });
      const hasCompletedOrder = userOrders.some(order => order.status === 'Completed');
      const hasAnyOrder = userOrders.length > 0;

      return {
        ...request.toObject(),
        userHasCompletedOrder: hasCompletedOrder,
        userHasOrder: hasAnyOrder
      };
    })
  );
};

// Get all normal maintenance requests
exports.getAllNormalRequests = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const skip = (page - 1) * limit;

  const normalRequests = await MaintenanceRequest.find({ type: 'normal' })
    .populate('user')
    .populate('address')
    .skip(skip)
    .limit(limit);
  const enhancedRequests = await enhanceRequestsWithOrderInfo(normalRequests);
  const total = await MaintenanceRequest.countDocuments({ type: 'normal' });

  res.status(200).json({
    status: 'success',
    results: enhancedRequests.length,
    data: {
      requests: enhancedRequests,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    }
  });
});

// Get all urgent maintenance requests
exports.getAllUrgentRequests = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const skip = (page - 1) * limit;

  const urgentRequests = await MaintenanceRequest.find({ type: 'urgent' })
    .populate('user')
    .populate('address')
    .skip(skip)
    .limit(limit);
  const enhancedRequests = await enhanceRequestsWithOrderInfo(urgentRequests);
  const total = await MaintenanceRequest.countDocuments({ type: 'urgent' });

  res.status(200).json({
    status: 'success',
    results: enhancedRequests.length,
    data: {
      requests: enhancedRequests,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
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
