const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductCategory',
    required: [true, 'Category is required']
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
    required: [true, 'Name is required']
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  mainPhoto: {
    type: String,
    required: [true, 'Main photo is required']
  },
  photos: [String],
  cloudinaryFolder: String,
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);