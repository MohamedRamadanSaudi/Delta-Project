const ProductCategory = require('../models/productCategoryModel');
const mongoose = require('mongoose');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const cloudinary = require('../config/cloudinary');
const multer = require('multer');

// Utility function to validate MongoDB Object IDs
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Middleware for handling file uploads
const upload = multer({ dest: 'uploads/' });

// Create Category
const createCategory = catchAsync(async (req, res, next) => {
  const { title } = req.body;

  let photo = '';
  if (req.file && req.file.path) {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'categories'
    });
    photo = result.secure_url;
  }

  const newCategory = new ProductCategory({
    title,
    photo,
  });

  await newCategory.save();
  res.status(201).json(newCategory);
});

// Update Category
const updateCategory = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { title } = req.body;

  if (!isValidObjectId(id)) {
    return next(new AppError('Invalid category ID', 400));
  }

  let photo = '';
  if (req.file && req.file.path) {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'categories'
    });
    photo = result.secure_url;
  }

  const updateData = { title };
  if (photo) updateData.photo = photo;

  const updatedCategory = await ProductCategory.findByIdAndUpdate(id, updateData, { new: true });

  if (!updatedCategory) {
    return next(new AppError('Category not found', 404));
  }

  res.json(updatedCategory);
});

// Delete Category
const deleteCategory = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    return next(new AppError('Invalid category ID', 400));
  }

  // Check if category is "all" don't allow to delete
  const productCategory = await ProductCategory.findById(id);
  if (productCategory.title == 'الكل') {
    return next(new AppError('Cannot delete default category', 400));
  }

  const category = await ProductCategory.findByIdAndDelete(id);
  if (!category) {
    return next(new AppError('Category not found', 404));
  }

  // Delete category photo from Cloudinary if exists
  if (category.photo) {
    const photoPublicId = category.photo.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(`categories/${photoPublicId}`);
  }

  res.json({ message: 'Category deleted successfully', deletedCategory: category });
});

// Get Category
const getCategory = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    return next(new AppError('Invalid category ID', 400));
  }

  const category = await ProductCategory.findById(id);
  if (!category) {
    return next(new AppError('Category not found', 404));
  }
  res.json(category);
});

// Get All Categories
const getAllCategories = catchAsync(async (req, res, next) => {
  const categories = await ProductCategory.find();
  const total = await ProductCategory.countDocuments();

  res.status(200).json({
    status: 'success',
    results: categories.length,
    data: {
      categories
    }
  });
});

module.exports = {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategory,
  getAllCategories,
  upload
};
