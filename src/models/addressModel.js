const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  city: {
    type: String,
    required: [true, 'Please provide the city']
  },
  area: {
    type: String,
    required: [true, 'Please provide the area']
  },
  street: {
    type: String,
    required: [true, 'Please provide the street']
  },
  building: {
    type: String,
    required: [true, 'Please provide the building number']
  },
  locationLink: {
    type: String,
    required: [true, 'Please provide the location link']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

const Address = mongoose.model('Address', addressSchema);

module.exports = Address;
