const express = require('express');
const router = express.Router();
const { registerToken } = require('../controllers/deviceController');
const { sendCustomNotification, getNotifications, deleteNotification } = require('../controllers/notificationController');
const auth = require('../middlewares/AuthMiddleware');

// Existing routes
router.post('/registerToken', auth.auth, registerToken);
router.post('/sendNotification', auth.auth, auth.isAdmin, sendCustomNotification);

// Route for fetching notifications
router.get('/getNotifications', auth.auth, getNotifications);

// Route for deleting a notification
router.delete('/deleteNotification/:id', auth.auth, auth.isAdmin, deleteNotification);

module.exports = router;
