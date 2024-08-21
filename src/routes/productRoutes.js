const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middlewares/AuthMiddleware');

// Create a new product
router.post('/', auth.auth, auth.isAdmin, productController.uploadProductMainPhoto, productController.createProduct);

// Route to upload additional photos for a product
router.post('/:id/photos', auth.auth, auth.isAdmin, productController.uploadProductPhotos, productController.uploadProductPhotosForProduct);

// Route to update the main photo for a product
router.post('/:id/main-photo', auth.auth, auth.isAdmin, productController.uploadProductMainPhoto, productController.updateProductMainPhoto);

// Get all products, optionally filtered by category
router.get('/', productController.getProducts);
router.get('/admin', auth.auth, auth.isAdmin, productController.getProducts);

// Search products by name
router.get('/search', productController.searchProductsByName);
router.get('/admin/search', auth.auth, auth.isAdmin, productController.searchProductsByName);

// Get a single product by ID
router.get('/:id', productController.getProductById);
router.get('/admin/:id', auth.auth, auth.isAdmin, productController.getProductById);

// Update a product by ID
router.patch('/:id', auth.auth, auth.isAdmin, productController.updateProduct);

// Delete a product by ID
router.delete('/:id', auth.auth, auth.isAdmin, productController.deleteProduct);

module.exports = router;
