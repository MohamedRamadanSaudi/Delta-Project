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
  firstBatch: {
    type: String,
    default: ''
  },
  secondBatch: {
    type: String,
    default: ''
  },
  thirdBatch: {
    type: String,
    default: ''
  },
  cartItems: [cartItemSchema],
  contractStages: {
    type: String,
    enum: ['Pending', 'Signature'],
    default: 'Pending',
    validate: {
      validator: function(value) {
        return ['Pending', 'Signature'].includes(value);
      },
      message: props => `${props.value} is not a valid contract stage`
    }
  },
  implementationStages: {
    type: String,
    enum: ['pending', 'ordering', 'shipping', 'fees', 'delivering', 'installing', 'continuee', 'completed', 'cancelled'],
    default: 'pending',
    validate: {
      validator: function(value) {
        return ['pending', 'ordering', 'shipping', 'fees', 'delivering', 'installing', 'continuee', 'completed', 'cancelled'].includes(value);
      },
      message: props => `${props.value} is not a valid implementation stage`
    }
  },
  status: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
