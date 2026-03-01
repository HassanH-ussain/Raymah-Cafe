const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET /api/products — list in-stock products, optionally filtered by ?category=
router.get('/', async (req, res, next) => {
  try {
    const filter = { inStock: true };
    if (req.query.category) filter.category = req.query.category;
    const products = await Product.find(filter).sort({ createdAt: 1 });
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
