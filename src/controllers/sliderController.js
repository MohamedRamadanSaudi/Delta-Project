const Slider = require('../models/sliderModel');
const cloudinary = require('../config/cloudinary');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// Add a new photo to the slider
exports.addPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('No file uploaded!', 400));
  }

  // The file is already uploaded to Cloudinary by Multer, we just need to save the URL in the database
  const newPhoto = await Slider.create({ photoUrl: req.file.path });

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
  const { id } = req.params;

  const photo = await Slider.findByIdAndDelete(id);
  if (!photo) {
    return next(new AppError('Photo not found', 404));
  }

  // Extract the public ID from the photo URL
  const publicId = photo.photoUrl.match(/slider\/(.*?)\.(\w{3,4})(?:$|\?)/)[1];
  await cloudinary.uploader.destroy(`slider/${publicId}`);

  res.status(204).json({
    status: 'success',
    data: null
  });
});
