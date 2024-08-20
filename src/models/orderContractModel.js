const mongoose = require('mongoose');

const orderContractSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'PDF must be associated with a user']
  },
  filePath: {
    type: String,
    required: [true, 'PDF must have a file path']
  },
  fileName: {
    type: String,
    required: [true, 'PDF must have a file name']
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

const OrderContract = mongoose.model('OrderContract', orderContractSchema);

module.exports = OrderContract;
