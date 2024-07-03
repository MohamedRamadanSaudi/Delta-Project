const mongoose = require("mongoose");

const subCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  subCategories: [{
    type: String
  }]
}, { _id: false });

const productCategorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  subCategories: [subCategorySchema]
}, {
  timestamps: true,
});

module.exports = mongoose.model("ProductCategory", productCategorySchema);