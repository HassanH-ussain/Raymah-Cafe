const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  customizations: {
    size: { type: String, default: '' },
    milk: { type: String, default: '' },
    temperature: { type: String, default: '' },
    addOns: [{ type: String }],
    specialInstructions: { type: String, default: '' },
  },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true },
    customer: {
      firstName: { type: String, required: [true, 'First name is required'], trim: true },
      lastName: { type: String, required: [true, 'Last name is required'], trim: true },
      email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
      },
      phone: { type: String, required: [true, 'Phone number is required'], trim: true },
    },
    items: {
      type: [orderItemSchema],
      validate: [(arr) => arr.length > 0, 'Order must contain at least one item'],
    },
    orderType: {
      type: String,
      required: [true, 'Order type is required'],
      enum: ['delivery', 'pickup'],
    },
    deliveryAddress: {
      address: String,
      apartment: String,
      city: String,
      state: String,
      zip: String,
      instructions: String,
    },
    pickupTime: { type: String },
    // We never store raw card numbers — just the method label
    paymentMethod: {
      type: String,
      required: [true, 'Payment method is required'],
      enum: ['card', 'paypal', 'applepay'],
    },
    pricing: {
      subtotal: { type: Number, required: true },
      deliveryFee: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      tax: { type: Number, required: true },
      tip: { type: Number, default: 0 },
      total: { type: Number, required: true },
    },
    promoCode: { type: String, default: '' },
    stripePaymentIntentId: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // optional — set when customer is logged in
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

// Auto-generate a human-readable order number before the first save
orderSchema.pre('save', function (next) {
  if (!this.orderNumber) {
    this.orderNumber = 'RMH-' + Date.now().toString().slice(-6);
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
