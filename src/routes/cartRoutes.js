const express = require('express');
const cartController = require('../controllers/cartController');
const auth = require('../middlewares/AuthMiddleware');

const router = express.Router();

router.use(auth.auth);

router.get('/', cartController.getCart);
router.post('/add', cartController.addToCart);
router.post('/remove', cartController.removeFromCart);

module.exports = router;
