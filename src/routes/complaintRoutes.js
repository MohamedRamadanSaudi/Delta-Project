const express = require('express');
const complaintController = require('../controllers/complaintController');
const auth = require('../middlewares/AuthMiddleware');

const router = express.Router();

router.post('/create', complaintController.createComplaint);

router.get('/', auth.auth, auth.isAdmin, complaintController.getAllComplaints);
router.get('/:id', auth.auth, auth.isAdmin, complaintController.getComplaint);

router.delete('/:id', auth.auth, auth.isAdmin, complaintController.deleteComplaint);

module.exports = router;
