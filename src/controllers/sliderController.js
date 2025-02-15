const Slider = require('../models/sliderModel');
const cloudinary = require('../config/cloudinary');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// Add a new photo to the slider
exports.addPhoto = catchAsync(async (req, res, next) => {
  const { productId } = req.body;

  if (!req.file) {
    return next(new AppError('No file uploaded!', 400));
  }

  if (!productId) {
    return next(new AppError('Product ID is required!', 400));
  }

  // Ensure the file path is correct, taking it from the Cloudinary response
  const newPhoto = await Slider.create({
    photoUrl: req.file.path,
    productId: productId
  });

  res.status(201).json({
    status: 'success',
    data: {
      photo: newPhoto
    }
  });
});

// Get all slider photos
exports.getAllPhotos = catchAsync(async (req, res, next) => {
  const photos = await Slider.find();
  res.status(200).json({
    status: 'success',
    results: photos.length,
    data: {
      photos
    }
  });
});

// Delete a photo from the slider
exports.deletePhoto = catchAsync(async (req, res, next) => {
  const photo = await Slider.findById(req.params.id);

  if (!photo) {
    return next(new AppError('No photo found with that ID', 404));
  }

  // Delete the photo from Cloudinary
  const publicId = photo.photoUrl.split('/').pop().split('.')[0];
  await cloudinary.uploader.destroy(`slider/${publicId}`);

  // Remove the photo from the database
  await Slider.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null
  });
});
