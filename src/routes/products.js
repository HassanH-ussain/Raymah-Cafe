const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET /api/products — list all in-stock products
router.get('/', async (req, res, next) => {
  try {
    const products = await Product.find({ inStock: true }).sort({ createdAt: 1 });
    res.json({ success: true, count: products.length, data: products });
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:id — single product
router.get('/:id', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
