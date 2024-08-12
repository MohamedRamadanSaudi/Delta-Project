const mongoose = require('mongoose');

const sellsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide the name']
  },
  email: {
    type: String,
    required: [true, 'Please provide the email'],
    unique: [true, 'Email already exists'],
  },
  phone: {
    type: String,
    required: [true, 'Please provide the phone'],
  },
});

const Sells = mongoose.model('Sells', sellsSchema);

module.exports = Sells;
