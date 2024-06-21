const mongoose = require('mongoose');

const maintenanceRequestSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['normal', 'urgent'],
    required: true
  },
  title: {
    type: String,
    required: [true, 'A maintenance request must have a title']
  },
  description: {
    type: String,
    required: [true, 'A maintenance request must have a description']
  },
  date: {
    type: Date,
    required: [true, 'A maintenance request must have a date']
  },
  time: {
    type: String,
    enum: ['am', 'pm'],
    required: [true, 'A maintenance request must specify time as either "am" or "pm"']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

const MaintenanceRequest = mongoose.model('MaintenanceRequest', maintenanceRequestSchema);

module.exports = MaintenanceRequest;
