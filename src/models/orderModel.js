const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product is required']
  }
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Order must belong to a user']
  },
  name: {
    type: String,
    required: [true, 'Name is required']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required']
  },
  address: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address',
    required: [true, 'Address is required']
  },
  cartItems: [cartItemSchema],
  contractStages: {
    type: String,
    enum: ['Pending', 'Cabin-Selection', 'Floor-Selection', "Doors-Selection", 'Approve', 'Signature'],
    default: 'Pending'
  },
  implementationStages: {
    type: String,
    enum: ['Pending', 'Manufacturing-Started', "Shipping", 'Customs', 'Arrival-At-The-Site','Mechanical-Installation', 'Electricity-Connection-And-Elevator-Operation', 'Elevator-Delivery'],
    default: 'Pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
