const express = require('express');
const sliderController = require('../controllers/sliderController');
const upload = require('../config/multer');
const auth = require('../middlewares/AuthMiddleware');

const router = express.Router();

// Route for getting all photos (accessible by all users)
router.route('/').get(auth.auth, sliderController.getAllPhotos);

// Route for adding a photo (admin only)
router.route('/').post(auth.auth, auth.isAdmin, upload.single('photo'), sliderController.addPhoto);

// Route for deleting a photo (admin only)
router.route('/:id').delete(auth.auth, auth.isAdmin, sliderController.deletePhoto);

module.exports = router;
