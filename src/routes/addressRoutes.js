const express = require('express');
const addressController = require('../controllers/addressController');
const auth = require('../middlewares/AuthMiddleware');

const router = express.Router();

router.use(auth.auth);

router.post('/', auth.auth, addressController.createAddress);
router.get('/', auth.auth, addressController.getAddresses);
router.get('/:id', auth.auth, addressController.getAddress);
router.patch('/:id', auth.auth, addressController.updateAddress);
router.delete('/:id', auth.auth, addressController.deleteAddress);

module.exports = router;
