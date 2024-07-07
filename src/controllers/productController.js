const mongoose = require('mongoose');
const Product = require('../models/productModel');
const Category = require('../models/productCategoryModel');
const User = require('../models/userModel');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const slugify = require('slugify');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const upload = require('../config/multer');

// Utility function to validate MongoDB Object IDs
function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// Middleware for handling file uploads
exports.uploadProductMainPhoto = upload.single('mainPhoto'); // Upload main photo
exports.uploadProductPhotos = upload.array('photos', 5); // Allow up to 5 photos per product

// Create a new product
exports.createProduct = catchAsync(async (req, res, next) => {
  const { category, subCategory, subSubCategory, name, description } = req.body;

  // Check if the category name is provided
  if (!category) {
    return next(new AppError('Category name is required', 400));
  }

  // Find the category by name
  const categoryExists = await Category.findOne({ title: category });
  if (!categoryExists) {
    return next(new AppError('Category not found', 404));
  }

  // Validate subCategory and subSubCategory if they are provided
  if (subCategory) {
    const subCategoryExists = categoryExists.subCategories.find(sc => sc.name === subCategory);
    if (!subCategoryExists) {
      return next(new AppError('SubCategory not found', 404));
    }

    if (subSubCategory) {
      if (!subCategoryExists.subSubCategories.includes(subSubCategory)) {
        return next(new AppError('SubSubCategory not found', 404));
      }
    }
  }

  // Create slug from product name
  const slug = slugify(name, { lower: true });

  if (req.file && req.file.path) {
    
      // Upload main photo to Cloudinary
      const mainPhotoResult = await cloudinary.uploader.upload(req.file.path, {
        public_id: `products/${slug}-${Date.now()}-main-photo`, // Ensure unique public_id
        overwrite: false, // Do not overwrite existing file
        tags: ['main_photo'], // Optional tags for organizing in Cloudinary
        transformation: [
          { width: 390, height: 250, crop: 'fill' },
          { quality: 90 }
        ]
      });
      const mainPhoto = mainPhotoResult.secure_url;

      // Create a new product
      const newProduct = new Product({
        category: categoryExists._id,
        subCategory,
        subSubCategory,
        slug,
        name,
        description,
        mainPhoto,
        photos: []
      });

      await newProduct.save();
      res.status(201).json(newProduct);
    
  } else {
    return next(new AppError('Main photo is required', 400));
  }
});

// Upload photos for an existing product
exports.uploadProductPhotosForProduct = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Validate if id is a valid MongoDB ObjectId
  if (!isValidObjectId(id)) {
    return next(new AppError('Invalid product ID', 400));
  }

  
    // Find the product by ID
    const product = await Product.findById(id);
    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    // Upload additional photos to Cloudinary
    const photos = [];
    if (req.files && req.files.length > 0) {
      const slug = product.slug; // Assuming you have a 'slug' field in your Product model
      const existingPhotosCount = product.photos.length; // Get the current number of photos

      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const uniqueIdentifier = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

        const photoResult = await cloudinary.uploader.upload(file.path, {
          public_id: `products/${slug}-${existingPhotosCount + i}-${uniqueIdentifier}`, // Ensure unique public_id
          overwrite: false, // Do not overwrite existing file
          tags: ['product_photo'], // Optional tags for organizing in Cloudinary
          transformation: [
            { width: 390, height: 250, crop: 'fill' },
            { quality: 90 }
          ]
        });

        photos.push(photoResult.secure_url);
      }

      // Add new photos to the product's photos array
      product.photos = [...product.photos, ...photos];
      await product.save();

      res.status(200).json({
        status: 'success',
        message: 'Photos uploaded successfully',
        data: {
          product
        }
      });
    } else {
      return next(new AppError('No photos were uploaded', 400));
    }
  
});

// Get all products, optionally filtered by category
exports.getProducts = catchAsync(async (req, res, next) => {
  let filter = {};

  // If categoryName is provided and it's not "All", filter by category name
  if (req.query.category && req.query.category.toLowerCase() !== 'all') {
    const category = await Category.findOne({ title: req.query.category });
    if (!category) {
      return next(new AppError('Category not found', 404));
    }
    filter.category = category._id;
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const skip = (page - 1) * limit;

  // If categoryName is provided and it's "All", do not apply category filter
  if (req.query.category && req.query.category.toLowerCase() === 'all') {
    filter = {}; // Clear the filter to fetch all products
  }

  const products = await Product.find(filter).populate('category').skip(skip).limit(limit);
  const total = await Product.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    results: products.length,
    data: {
      products,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    }
  });
});

// Get a single product by ID
exports.getProductById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    return next(new AppError('Invalid product ID', 400));
  }

  const product = await Product.findById(id).populate('category');
  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  // Fetch up to 5 related products from the same category
  const relatedProducts = await Product.aggregate([
    { $match: { _id: { $ne: product._id }, category: product.category } }, // Exclude the current product and match the same category
    { $sample: { size: 5 } } // Get up to 5 random products
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      product,
      relatedProducts
    }
  });
});

// Update a product by ID
exports.updateProduct = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    return next(new AppError('Invalid product ID', 400));
  }

  
    // Build the update object from req.body
    const updateObject = {};
    for (const key in req.body) {
      if (key === 'category') {
        // Assuming 'category' can be either ObjectId or category title
        const category = await Category.findOne({ title: req.body[key] });
        if (category) {
          updateObject.category = category._id; // Update with the category ObjectId
        } else {
          // Handle case where category title doesn't exist
          return next(new AppError('Category not found', 404));
        }
      } else {
        updateObject[key] = req.body[key]; // Directly update other fields
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateObject, {
      new: true,
      runValidators: true,
    });

    if (!updatedProduct) {
      return next(new AppError('Product not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        product: updatedProduct,
      },
    });
  
});
// Update the main photo of a product by ID
exports.updateProductMainPhoto = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    return next(new AppError('Invalid product ID', 400));
  }

  
    // Find the product by ID
    const product = await Product.findById(id);
    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    // Delete the old main photo from Cloudinary
    if (product.mainPhoto) {
      const mainPhotoPublicId = product.mainPhoto.match(/products\/(.*?)\.(\w{3,4})(?:$|\?)/)[1];
      await cloudinary.uploader.destroy(`products/${mainPhotoPublicId}`);
    }

    // Upload new main photo to Cloudinary
    const slug = product.slug; // Assuming you have a 'slug' field in your Product model
    const mainPhotoResult = await cloudinary.uploader.upload(req.file.path, {
      public_id: `products/${slug}-${Date.now()}-main-photo`, // Ensure unique public_id
      overwrite: false, // Do not overwrite existing file
      tags: ['main_photo'] // Optional tags for organizing in Cloudinary
    });

    // Update the main photo URL in the product
    product.mainPhoto = mainPhotoResult.secure_url;
    await product.save();

    res.status(200).json({
      status: 'success',
      message: 'Main photo updated successfully',
      data: {
        product
      }
    });
  
});

// Delete a product by ID
exports.deleteProduct = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    return next(new AppError('Invalid product ID', 400));
  }

  
    // Find the product by ID
    const product = await Product.findById(id);
    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    // Delete main photo from Cloudinary if exists
    if (product.mainPhoto) {
      const mainPhotoPublicId = product.mainPhoto.match(/products\/(.*?)\.(\w{3,4})(?:$|\?)/)[1];
      await cloudinary.uploader.destroy(`products/${mainPhotoPublicId}`);
    }

    // Delete additional photos from Cloudinary if exist
    if (product.photos.length > 0) {
      for (const photoUrl of product.photos) {
        const photoPublicId = photoUrl.match(/products\/(.*?)\.(\w{3,4})(?:$|\?)/)[1];
        await cloudinary.uploader.destroy(`products/${photoPublicId}`);
      }
    }

    // Delete the product from the database
    await product.deleteOne();

    res.status(200).json({ message: 'Product deleted' });
  
});

// Search products by name with pagination
exports.searchProductsByName = catchAsync(async (req, res, next) => {
  const { name } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const skip = (page - 1) * limit;

  // Validate name query parameter
  if (!name) {
    return next(new AppError('Product name is required', 400));
  }

  const products = await Product.find({ name: { $regex: name, $options: 'i' } })
    .skip(skip)
    .limit(limit)
    .populate('category');

  const total = await Product.countDocuments({ name: { $regex: name, $options: 'i' } });

  res.status(200).json({
    status: 'success',
    results: products.length,
    data: {
      products,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    }
  });
});
