const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { sendOrderReceipt } = require('../services/email');
const jwt = require('jsonwebtoken');

// POST /api/orders/create-payment-intent — create a Stripe PaymentIntent
router.post('/create-payment-intent', async (req, res, next) => {
  try {
    const { amount } = req.body;
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // cents
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
    });
    res.json({ success: true, clientSecret: paymentIntent.client_secret });
  } catch (err) {
    next(err);
  }
});

// POST /api/orders — place a new order
router.post('/', async (req, res, next) => {
  try {
    const body = { ...req.body };

    // Attach userId if a valid JWT is present — optional, never required
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const payload = jwt.verify(authHeader.slice(7), process.env.JWT_SECRET);
        body.userId = payload.sub;
      } catch { /* ignore — guest checkout is fine */ }
    }

    const order = new Order(body);
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

    // Fire-and-forget — email failure must never affect the order response
    sendOrderReceipt(order).catch(err =>
      console.error(`[email] Receipt failed for order ${order.orderNumber}:`, err.message)
    );
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

// GET /api/orders/track/:orderNumber — public tracking by human-readable order number
// Returns only non-sensitive fields (no email, phone, payment info)
router.get('/track/:orderNumber', async (req, res, next) => {
  try {
    const order = await Order.findOne(
      { orderNumber: req.params.orderNumber.toUpperCase() },
      'orderNumber status orderType createdAt customer.firstName items pricing'
    );
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, data: order });
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
