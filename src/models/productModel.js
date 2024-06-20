const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'productCategory',
    required: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  name: {
    type: String,
    unique: true,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  mainPhoto: {
    type: String,
    required: true
  },
  photos: [String]
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);