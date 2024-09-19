const multer = require('multer');
const path = require('path');
const MaintenanceContract = require('../models/maintenanceContractModel');
const MaintenanceRequest = require('../models/maintenanceRequestModel');
const User = require('../models/userModel');
const { uploadFile, deleteFile } = require('../utils/googleDrive');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const fs = require('fs');

// Ensure the uploads directory exists
const ensureUploadsDirExists = () => {
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
  }
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    ensureUploadsDirExists();
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// Set file size limit to 5MB (5 * 1024 * 1024 bytes)
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    // Accept PDF files only
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new AppError('Only PDF files are allowed!', 400), false);
    }
  }
});

// Middleware for uploading a PDF
exports.uploadPDF = upload.single('pdf');

// Upload a PDF
exports.uploadPDFFile = catchAsync(async (req, res, next) => {
  const { userId, maintenanceRequestId } = req.body;

  // check if user already exists
  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Check if maintenance request exists
  const maintenanceRequest = await MaintenanceRequest.findById(maintenanceRequestId);
  if (!maintenanceRequest) {
    return next(new AppError('Maintenance request not found', 404));
  }

  if (!req.file) {
    return next(new AppError('No file uploaded', 400));
  }

  const filePath = path.join(__dirname, '..', 'uploads', req.file.filename);
  const uploadedFile = await uploadFile(filePath);

  const pdf = await MaintenanceContract.create({
    user: userId,
    filePath: uploadedFile.id,
    fileName: req.file.originalname
  });

  // Associate the PDF with the maintenance request
  maintenanceRequest.pdfId = pdf._id;
  await maintenanceRequest.save();

  // Delete the file from the local filesystem
  fs.unlinkSync(filePath);

  res.status(201).json({
    status: 'success',
    data: {
      pdf
    }
  });
});

// Delete a PDF
exports.deletePDF = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const pdf = await MaintenanceContract.findById(id);

  if (!pdf) {
    return next(new AppError('PDF not found', 404));
  }

  // Delete the file from Google Drive
  await deleteFile(pdf.filePath);

  // Remove the PDF document from the database
  await MaintenanceContract.findByIdAndDelete(id);

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Download a PDF
exports.downloadPDF = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const pdf = await MaintenanceContract.findById(id);

  if (!pdf) {
    return next(new AppError('PDF not found', 404));
  }

  // Generate a download URL
  const downloadUrl = `https://drive.google.com/uc?export=download&id=${pdf.filePath}`;

  res.status(200).json({
    status: 'success',
    data: {
      fileName: pdf.fileName,
      downloadUrl: downloadUrl
    }
  });
});
// Get PDF ID for a specific user
exports.getPdfIdsForUser = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  const pdfs = await MaintenanceContract.find({ user: userId }).select('user');

  if (!pdfs.length) {
    return next(new AppError('No PDFs found for this user', 404));
  }

  res.status(200).json({
    status: 'success',
    results: pdfs.length,
    data: {
      pdfId: pdfs.map(pdf => pdf._id)
    }
  });
});