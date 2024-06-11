const Complaint = require('../models/complaintModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.createComplaint = catchAsync(async (req, res, next) => {
  const { name, phone, message } = req.body;

  if (!name || !phone || !message) {
    return next(new AppError('Please provide your name, phone, and message', 400));
  }

  const complaint = await Complaint.create({ name, phone, message });

  res.status(201).json({
    status: 'success',
    data: {
      complaint
    }
  });
});

exports.getAllComplaints = catchAsync(async (req, res, next) => {
  const complaints = await Complaint.find();

  res.status(200).json({
    status: 'success',
    results: complaints.length,
    data: {
      complaints
    }
  });
});

exports.getComplaint = catchAsync(async (req, res, next) => {
  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    return next(new AppError('No complaint found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      complaint
    }
  });
});

exports.deleteComplaint = catchAsync(async (req, res, next) => {
  const complaint = await Complaint.findByIdAndDelete(req.params.id);

  if (!complaint) {
    return next(new AppError('No complaint found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});
