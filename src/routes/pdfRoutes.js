const express = require('express');
const pdfController = require('../controllers/pdfController');
const auth = require('../middlewares/AuthMiddleware');

const router = express.Router();

// Admin routes
router.post('/upload', auth.auth, auth.isAdmin, pdfController.uploadPDF, pdfController.uploadPDFFile);
router.delete('/:id', auth.auth, auth.isAdmin, pdfController.deletePDF);

// User routes
router.get('/:id/download', auth.auth, pdfController.downloadPDF);

// New route to get PDF IDs for a specific user
router.get('/user/:userId', auth.auth, pdfController.getPdfIdsForUser);

module.exports = router;
