const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 1
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
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Processing','Completed', 'Cancelled'],
    default: 'Pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
