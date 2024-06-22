const express = require('express');
const router = express.Router();
const { sendCustomNotification } = require('../controllers/notificationController');
const auth = require('../middlewares/AuthMiddleware');

router.post('/sendNotification', auth.auth, auth.isAdmin, sendCustomNotification);

module.exports = router;