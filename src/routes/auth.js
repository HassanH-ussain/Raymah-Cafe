const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const Order = require('../models/Order');
const requireAuth = require('../middleware/auth');

function signToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
}

// POST /api/auth/register — create a new account, return JWT
router.post('/register', async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ firstName, lastName, email, passwordHash });

    const token = signToken(user._id);
    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login — verify credentials, return JWT
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // passwordHash is excluded by default (select: false) — re-include it here
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+passwordHash');
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = signToken(user._id);
    res.json({
      success: true,
      token,
      user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me — return current user profile (requires auth)
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.sub);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({
      success: true,
      user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, createdAt: user.createdAt },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/orders — order history for the authenticated user (requires auth)
router.get('/orders', requireAuth, async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user.sub })
      .sort({ createdAt: -1 })
      .select('orderNumber status orderType createdAt items pricing');
    res.json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
