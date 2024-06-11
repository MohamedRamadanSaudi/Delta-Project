const mongoose = require('mongoose');
const validator = require('validator');

const complaintSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name']
  },
  phone: {
    type: String,
    required: [true, 'Please provide your phone number'],
    unique: true,
    validate: [validator.isMobilePhone, 'Please provide a valid phone number']
  },
  message: {
    type: String,
    required: [true, 'Please provide your message']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Complaint = mongoose.model('Complaint', complaintSchema);

module.exports = Complaint;
