const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  category: {
    type: String,
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