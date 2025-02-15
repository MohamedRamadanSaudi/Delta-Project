const mongoose = require('mongoose');
const Product = require('../models/productModel');
const Category = require('../models/productCategoryModel');
const slugify = require('slugify');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const cloudinary = require('../config/cloudinary');
const upload = require('../config/multer');
const Cart = require('../models/cartModel');

// Utility function to validate MongoDB Object IDs
function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// Middleware for handling file uploads
exports.uploadProductMainPhoto = upload.single('mainPhoto'); // Upload main photo
exports.uploadProductPhotos = upload.array('photos', 5); // Allow up to 5 photos per product

// Create a new product
exports.createProduct = catchAsync(async (req, res, next) => {
  const { category, name, description } = req.body;

  if (!category) {
    return next(new AppError('Category name is required', 400));
  }

  const categoryExists = await Category.findOne({ title: category });
  if (!categoryExists) {
    return next(new AppError('Category not found', 404));
  }

  const slug = slugify(name, { lower: true });
  const productFolderId = new mongoose.Types.ObjectId().toString();

  if (req.file && req.file.path) {
    const mainPhotoResult = await cloudinary.uploader.upload(req.file.path, {
      folder: `products/${productFolderId}`
    });

    const photos = [];
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file =>
        cloudinary.uploader.upload(file.path, {
          folder: `products/${productFolderId}`
        })
      );

      const uploadResults = await Promise.all(uploadPromises);
      uploadResults.forEach(result => photos.push(result.secure_url));
    }

    const newProduct = new Product({
      category: categoryExists._id,
      slug,
      name,
      description,
      mainPhoto: mainPhotoResult.secure_url,
      photos,
      cloudinaryFolder: `products/${productFolderId}`
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

  if (!isValidObjectId(id)) {
    return next(new AppError('Invalid product ID', 400));
  }

  const product = await Product.findById(id);
  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  const existingPhotosCount = product.photos.length;
  if (existingPhotosCount >= 5) {
    return next(new AppError('Product already has the maximum number of photos', 400));
  }

  const maxUploads = 5 - existingPhotosCount;
  const filesToUpload = req.files.slice(0, maxUploads);

  const uploadPromises = filesToUpload.map(file =>
    cloudinary.uploader.upload(file.path, {
      folder: product.cloudinaryFolder
    })
  );
  const uploadResults = await Promise.all(uploadPromises);

  const photos = uploadResults.map(result => result.secure_url);

  product.photos = [...product.photos, ...photos];
  await product.save();

  res.status(200).json({
    status: 'success',
    message: 'Photos uploaded successfully',
    data: {
      product
    }
  });
});

// Get all products, optionally filtered by category
exports.getProducts = catchAsync(async (req, res, next) => {
  let filter = {};

  // If categoryName is provided and it's not "All", filter by category name
  if (req.query.category && req.query.category.toLowerCase() !== 'الكل') {
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
  if (req.query.category && req.query.category.toLowerCase() === 'الكل') {
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

  const product = await Product.findById(id);
  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  if (product.mainPhoto) {
    const mainPhotoPublicId = product.mainPhoto.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(`${product.cloudinaryFolder}/${mainPhotoPublicId}`);
  }

  const result = await cloudinary.uploader.upload(req.file.path, {
    folder: product.cloudinaryFolder
  });

  product.mainPhoto = result.secure_url;
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

  const product = await Product.findById(id);
  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  if (product.cloudinaryFolder) {
    try {
      // Delete all resources in the folder
      const { resources } = await cloudinary.api.resources({
        type: 'upload',
        prefix: product.cloudinaryFolder
      });

      const deletePromises = resources.map(resource =>
        cloudinary.uploader.destroy(resource.public_id)
      );

      await Promise.all(deletePromises);

      // Check and delete any photos in the root folder with the same product ID in their public ID
      const rootResources = await cloudinary.api.resources({
        type: 'upload',
        prefix: 'products'
      });

      const rootDeletePromises = rootResources.resources
        .filter(resource => resource.public_id.includes(product.cloudinaryFolder))
        .map(resource => cloudinary.uploader.destroy(resource.public_id));

      await Promise.all(rootDeletePromises);

      // Now try to delete the empty folder
      await cloudinary.api.delete_folder(product.cloudinaryFolder);
    } catch (error) {
      return next(new AppError('Error deleting product images', 500));
    }
  }

  await product.deleteOne();

  // Remove the deleted product from all carts
  removeProductFromAllCarts(id);

  res.status(200).json({ message: 'Product and associated images deleted successfully' });
});

// Function to remove a product from all carts
async function removeProductFromAllCarts(productId) {
  try {
    await Cart.updateMany(
      { "items.product": productId },
      { $pull: { items: { product: productId } } }
    );
  } catch (error) {
    throw new Error('Error removing product from carts');
  }
}

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
