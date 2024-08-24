const express = require('express');
const multer = require('multer');
const maintenanceRequestController = require('../controllers/maintenanceRequestController');
const auth = require('../middlewares/AuthMiddleware');

const router = express.Router();

// Configure Multer
const upload = multer({ dest: 'uploads/' });

// Create a new maintenance request with optional file uploads
router.post('/', 
  auth.auth, 
  upload.fields([
    { name: 'photos', maxCount: 5 },
    { name: 'video', maxCount: 1 }
  ]),
  maintenanceRequestController.createMaintenanceRequest
);

// Get all normal maintenance requests
router.get('/normal', auth.auth, auth.isAdmin, maintenanceRequestController.getAllNormalRequests);

// Get all urgent maintenance requests
router.get('/urgent', auth.auth, auth.isAdmin, maintenanceRequestController.getAllUrgentRequests);

// Get my maintenance requests
router.get('/user', auth.auth, maintenanceRequestController.getMyMaintenanceRequests);

// Get a maintenance request by ID
router.get('/:id', auth.auth, maintenanceRequestController.getMaintenanceRequestById);

// Update a maintenance request by ID
router.patch('/:id', auth.auth, auth.isAdmin, maintenanceRequestController.updateMaintenanceStatus);

// Delete a maintenance request by ID
router.delete('/:id', auth.auth, auth.isAdmin, maintenanceRequestController.deleteMaintenanceRequest);

module.exports = router;
