const express = require('express');
const router = express.Router();
const { registerToken } = require('../controllers/deviceController');
const auth = require('../middlewares/AuthMiddleware');

router.post('/registerToken', auth.auth, auth.isAdmin, registerToken);

module.exports = router;