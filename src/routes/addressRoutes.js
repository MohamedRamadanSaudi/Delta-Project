const express = require('express');
const addressController = require('../controllers/addressController');
const auth = require('../middlewares/AuthMiddleware');

const router = express.Router();

router.use(auth.auth);

router.post('/', addressController.createAddress);
router.get('/', addressController.getAddresses);
router.patch('/:id', addressController.updateAddress);
router.delete('/:id', addressController.deleteAddress);

module.exports = router;
