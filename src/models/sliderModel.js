const mongoose = require('mongoose');

const sliderSchema = new mongoose.Schema({
  photoUrl: {
    type: String,
    required: [true, 'Photo URL is required']
  },
  productId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product'
  }
});

const Slider = mongoose.model('Slider', sliderSchema);

module.exports = Slider;