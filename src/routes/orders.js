const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// POST /api/orders — place a new order
router.post('/', async (req, res, next) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.status(201).json({
      success: true,
      data: {
        _id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        total: order.pricing.total,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/orders — list recent orders (admin / demo use)
router.get('/', async (req, res, next) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    next(err);
  }
});

// GET /api/orders/:id — single order
router.get('/:id', async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/orders/:id/status — update order status
router.patch('/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
