const express = require('express');
const router = express.Router();

const User = require('../controllers/userController');
const authController = require('../controllers/authController');
const auth = require('../middlewares/AuthMiddleware');

router.post('/seed-admin', authController.seedAdmin);
router.post('/signup', authController.signup);
router.post('/set-password', authController.setPasswordAfterOTP);
router.post('/login', authController.login);
router.post('/admin-login', authController.adminLogin);
router.post('/forgotPassword', authController.forgotPassword);
router.post('/logout', auth.auth, authController.logout);

router.get('/', auth.auth, auth.isAdmin, User.getAllUsers);
router.get('/me', auth.auth, User.getCurrentUser);
router.get('/:id', auth.auth, auth.isAdmin, User.getUser);

router.patch('/resetPassword', authController.resetPassword);
router.patch('/updateMyPassword', auth.auth, authController.updatePassword);
router.patch('/updateMe', auth.auth, User.updateMe);
router.patch('/:id', auth.auth, User.updateUser);

router.delete('/deleteMe', auth.auth, User.deleteMe);
router.delete('/:id', auth.auth, auth.isAdmin, User.deleteUser);

module.exports = router