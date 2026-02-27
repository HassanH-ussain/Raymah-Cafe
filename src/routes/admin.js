const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const adminAuth = require('../middleware/adminAuth');

// All admin routes require a valid x-admin-key header
router.use(adminAuth);

// GET /api/admin/orders — paginated order list with optional status filter
router.get('/orders', async (req, res, next) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const filter = status ? { status } : {};
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Order.countDocuments(filter);
    res.json({ success: true, total, page: Number(page), data: orders });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/stats — summary numbers for the dashboard header
router.get('/stats', async (req, res, next) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [total, pending, todayOrders] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: { $in: ['pending', 'confirmed', 'preparing'] } }),
      Order.find({ createdAt: { $gte: startOfDay } }),
    ]);

    const todayRevenue = todayOrders.reduce((sum, o) => sum + o.pricing.total, 0);

    res.json({
      success: true,
      data: { total, pending, todayRevenue: parseFloat(todayRevenue.toFixed(2)) },
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/orders/:id/status — update order status
router.patch('/orders/:id/status', async (req, res, next) => {
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
