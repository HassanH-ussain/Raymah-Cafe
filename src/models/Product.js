const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Product name is required'], trim: true },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['drinks-hot', 'drinks-cold', 'food', 'beans', 'merch'],
      default: 'beans',
    },
    origin: { type: String, required: [true, 'Origin is required'], trim: true },
    roast: {
      type: String,
      enum: ['Light', 'Medium', 'Medium-Dark', 'Dark', 'N/A'],
      default: 'N/A',
    },
    flavor: { type: String, required: [true, 'Flavor profile is required'], trim: true },
    description: { type: String, required: [true, 'Description is required'], trim: true },
    price: { type: Number, required: [true, 'Price is required'], min: [0, 'Price cannot be negative'] },
    inStock: { type: Boolean, default: true },
    badge: { type: String, default: null }, // e.g. 'Bestseller', 'Popular', 'New'
    // Visual data for dynamic SVG rendering in the frontend
    visual: {
      bodyFill: { type: String, default: '#1a1a1a' },
      innerOpacity: { type: String, default: '0.15' },
      gradientClass: { type: String, default: 'from-gold/20 to-dark' },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
