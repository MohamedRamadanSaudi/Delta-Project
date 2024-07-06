const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductCategory',
    required: true
  },
  subCategory: {
    type: String,
    required: false
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