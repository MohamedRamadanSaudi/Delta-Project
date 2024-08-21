const mongoose = require('mongoose');
const MaintenanceRequest = require('../models/maintenanceRequestModel');
const cloudinary = require('../config/cloudinary');
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

  // Handle file uploads
  let photoUrls = [];
  let videoUrl = '';

  if (req.files) {
    if (req.files.photos) {
      const photoUploadPromises = req.files.photos.map(file => 
        cloudinary.uploader.upload(file.path, { 
          resource_type: 'image',
          folder: 'maintenance_requests',
          quality: 'auto:low',
          fetch_format: 'auto',
        })
      );
      const photoResults = await Promise.all(photoUploadPromises);
      photoUrls = photoResults.map(result => result.secure_url);
    }

    if (req.files.video) {
      const videoResult = await cloudinary.uploader.upload(req.files.video[0].path, { 
        resource_type: 'video',
        folder: 'maintenance_requests',
        quality: 'auto:low',
        fetch_format: 'auto',
      });
      videoUrl = videoResult.secure_url;
    }
  }

  // Create new maintenance request
  const newRequest = await MaintenanceRequest.create({
    type,
    address,
    description,
    date,
    time,
    user: userId,
    photos: photoUrls,
    video: videoUrl
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
      // Handle cases where request.user is null
      if (!request.user) {
        return {
          ...request.toObject(),
          userHasCompletedOrder: false,
          userHasOrder: false
        };
      }

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

// Update maintenance status
exports.updateMaintenanceStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  
  const request = await MaintenanceRequest.findByIdAndUpdate(id, { status }, { new: true });
  
  if (!request) {
    return next(new AppError('Maintenance request not found', 404));
  }
  
  if (status === 'completed') {
    await mongoose.model('User').findByIdAndUpdate(request.user, { isUserHasMaintenanceRequest: true });
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      request
    }
  });
});

// Helper function to delete file from Cloudinary
const deleteFileFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log('File deleted from Cloudinary:', result);
  } catch (error) {
    console.error('Error deleting file from Cloudinary:', error);
  }
};

// Delete a maintenance request by ID
exports.deleteMaintenanceRequest = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const request = await MaintenanceRequest.findById(id);

  if (!request) {
    return next(new AppError('Maintenance request not found', 404));
  }

  // Delete photos from Cloudinary
  if (request.photos && request.photos.length > 0) {
    for (const photoUrl of request.photos) {
      const publicId = photoUrl.split('/').slice(-2).join('/').split('.')[0];
      await deleteFileFromCloudinary(publicId);
    }
  }

  // Delete video from Cloudinary
  if (request.video) {
    const videoPublicId = request.video.split('/').slice(-2).join('/').split('.')[0];
    await deleteFileFromCloudinary(videoPublicId);
  }

  // Delete the maintenance request from the database
  await MaintenanceRequest.findByIdAndDelete(id);

  res.status(204).json({
    status: 'success',
    data: null
  });
});