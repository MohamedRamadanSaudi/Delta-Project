const ProductCategory = require('../models/productCategoryModel');
const mongoose = require('mongoose');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// Utility function to validate MongoDB Object IDs
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Create Category
const createCategory = catchAsync(async (req, res, next) => {
  const newCategory = await ProductCategory.create(req.body);
  res.status(201).json(newCategory);
});

// Update Category
const updateCategory = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    return next(new AppError('Invalid category ID', 400));
  }

  const updatedCategory = await ProductCategory.findByIdAndUpdate(id, req.body, { new: true });
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

  const deletedCategory = await ProductCategory.findByIdAndDelete(id);
  if (!deletedCategory) {
    return next(new AppError('Category not found', 404));
  }
  res.json({ message: 'Category deleted successfully', deletedCategory });
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
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const skip = (page - 1) * limit;

  const categories = await ProductCategory.find().skip(skip).limit(limit);
  const total = await ProductCategory.countDocuments();

  res.status(200).json({
    status: 'success',
    results: categories.length,
    data: {
      categories,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    }
  });
});

module.exports = {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategory,
  getAllCategories,
};
