const express = require('express');
const categoryController = require('../controllers/productCategoryController');
const router = express.Router();

router
  .route('/')
  .post(categoryController.upload.single('photo'), categoryController.createCategory)
  .get(categoryController.getAllCategories);

router
  .route('/:id')
  .get(categoryController.getCategory)
  .put(categoryController.upload.single('photo'), categoryController.updateCategory)
  .delete(categoryController.deleteCategory);

module.exports = router;
