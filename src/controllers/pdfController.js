const multer = require('multer');
const path = require('path');
const PDF = require('../models/pdfModel');
const { uploadFile, deleteFile, getFile } = require('../utils/googleDrive');
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

const upload = multer({ storage });

// Middleware for uploading a PDF
exports.uploadPDF = upload.single('pdf');

// Upload a PDF
exports.uploadPDFFile = catchAsync(async (req, res, next) => {
  const { userId } = req.body;

  if (!req.file) {
    return next(new AppError('No file uploaded', 400));
  }

  const filePath = path.join(__dirname, '..', 'uploads', req.file.filename);
  const uploadedFile = await uploadFile(filePath);

  const pdf = await PDF.create({
    user: userId,
    filePath: uploadedFile.id,
    fileName: req.file.originalname
  });

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

  const pdf = await PDF.findById(id);

  if (!pdf) {
    return next(new AppError('PDF not found', 404));
  }

  // Delete the file from Google Drive
  await deleteFile(pdf.filePath);

  // Remove the PDF document from the database
  await PDF.findByIdAndDelete(id);

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Download a PDF
exports.downloadPDF = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const pdf = await PDF.findById(id);

  if (!pdf) {
    return next(new AppError('PDF not found', 404));
  }

  const fileStream = await getFile(pdf.filePath);
  res.setHeader('Content-Disposition', `attachment; filename=${pdf.fileName}`);
  fileStream.pipe(res);
});

// Get PDF ID for a specific user
exports.getPdfIdsForUser = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  const pdfs = await PDF.find({ user: userId }).select('user');

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