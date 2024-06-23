const express = require('express');
const orderController = require('../controllers/orderController');
const auth = require('../middlewares/authMiddleware');

const router = express.Router();

// User routes
router.post('/', auth.auth, orderController.createOrder);
router.get('/user', auth.auth, orderController.getUserOrders);

// Admin routes
router.get('/', auth.auth, auth.isAdmin, orderController.getAllOrders);
router.get('/:id', auth.auth, auth.isAdmin, orderController.getOrderById);
router.patch('/:id', auth.auth, auth.isAdmin, orderController.updateOrder);
router.delete('/:id', auth.auth, auth.isAdmin, orderController.deleteOrder);

module.exports = router;
