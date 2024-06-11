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
  flat: {
    type: String,
    required: [true, 'Please provide the flat number']
  },
  latitude: {
    type: Number,
    required: [true, 'Please provide the latitude']
  },
  longitude: {
    type: Number,
    required: [true, 'Please provide the longitude']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

const Address = mongoose.model('Address', addressSchema);

module.exports = Address;
