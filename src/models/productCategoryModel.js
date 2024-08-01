const mongoose = require("mongoose");

const productCategorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  photo: {
    type: String,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model("ProductCategory", productCategorySchema);