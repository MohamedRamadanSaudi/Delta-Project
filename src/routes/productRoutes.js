const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middlewares/AuthMiddleware');

// Create a new product
router.post('/', auth.auth, auth.isAdmin, productController.createProduct);

// Get all products
router.get('/', auth.auth, productController.getProducts);

// Get a single product by ID
router.get('/:id', auth.auth, productController.getProductById);

// Update a product by ID
router.put('/:id', auth.auth, auth.isAdmin, productController.updateProduct);

// Delete a product by ID
router.delete('/:id', auth.auth, auth.isAdmin, productController.deleteProduct);

module.exports = router;
