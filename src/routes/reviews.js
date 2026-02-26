const express = require('express');
const router = express.Router();
const Review = require('../models/Review');

// GET /api/reviews — list all reviews (newest first)
router.get('/', async (req, res, next) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 }).limit(20);
    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (err) {
    next(err);
  }
});

// POST /api/reviews — submit a new review
router.post('/', async (req, res, next) => {
  try {
    const { name, rating, text } = req.body;

    if (!name || !rating || !text) {
      return res.status(400).json({
        success: false,
        message: 'Name, rating, and review text are all required',
      });
    }

    const review = await Review.create({ name, rating: parseInt(rating, 10), text });
    res.status(201).json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
