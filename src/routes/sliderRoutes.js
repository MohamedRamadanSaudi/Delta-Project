const express = require('express');
const sliderController = require('../controllers/sliderController');
const upload = require('../config/multer');

const router = express.Router();

// Route for getting all photos (accessible by all users)
router.route('/').get(sliderController.getAllPhotos);

// Route for adding a photo (admin only)
router.route('/').post(upload.single('photo'), sliderController.addPhoto);

// Route for deleting a photo (admin only)
router.route('/:id').delete(sliderController.deletePhoto);

module.exports = router;
