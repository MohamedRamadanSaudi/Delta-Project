const express = require('express');
const categoryController = require('../controllers/productCategoryController');
const auth = require('../middlewares/AuthMiddleware');
const router = express.Router();

router.post('/', auth.auth, auth.isAdmin, categoryController.upload.single('photo'), categoryController.createCategory)
router.get('/', categoryController.getAllCategories)
router.get('/admin', auth.auth, auth.isAdmin, categoryController.getAllCategories)
router.get('/:id', categoryController.getCategory)
router.get('/admin/:id', auth.auth, auth.isAdmin, categoryController.getCategory)

router
  .route('/:id', auth.auth, auth.isAdmin)
  .put(categoryController.upload.single('photo'), categoryController.updateCategory)
  .delete(categoryController.deleteCategory);

module.exports = router;
