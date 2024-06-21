const express = require('express');
const maintenanceRequestController = require('../controllers/maintenanceRequestController');
const auth = require('../middlewares/AuthMiddleware');

const router = express.Router();

// Create a new maintenance request
router.post('/', auth.auth, maintenanceRequestController.createMaintenanceRequest);

// Get all normal maintenance requests
router.get('/normal', auth.auth, auth.isAdmin, maintenanceRequestController.getAllNormalRequests);

// Get all urgent maintenance requests
router.get('/urgent', auth.auth, auth.isAdmin, maintenanceRequestController.getAllUrgentRequests);

// Get a maintenance request by ID
router.get('/:id', auth.auth, auth.isAdmin, maintenanceRequestController.getMaintenanceRequestById);

// Delete a maintenance request by ID
router.delete('/:id', auth.auth, auth.isAdmin, maintenanceRequestController.deleteMaintenanceRequest);

module.exports = router;
