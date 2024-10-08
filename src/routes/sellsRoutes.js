const express = require('express');
const sellsController = require('../controllers/sellsController');
const auth = require('../middlewares/AuthMiddleware');

const router = express.Router();

router.post('/', auth.auth, auth.isAdmin, sellsController.createSell);
router.get('/', sellsController.getAllSells);
router.get('/:id', sellsController.getSell);
router.patch('/:id', auth.auth, auth.isAdmin, sellsController.updateSell);
router.delete('/:id', auth.auth, auth.isAdmin,sellsController.deleteSell);

module.exports = router;