const mongoose = require('mongoose');

const sellsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide the name']
  },
  email: {
    type: String,
    required: [true, 'Please provide the email'],
  },
  mobilePhone: {
    type: String,
    required: [true, 'Please provide the mobile phone number'],
  },
  whatsapp: {
    type: String,
    required: [true, 'Please provide the whatsapp number'],
  },
});

const Sells = mongoose.model('Sells', sellsSchema);

module.exports = Sells;
