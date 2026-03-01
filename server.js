require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const path = require('path');

const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/errorHandler');

const productRoutes = require('./src/routes/products');
const orderRoutes = require('./src/routes/orders');
const reviewRoutes = require('./src/routes/reviews');
const adminRoutes = require('./src/routes/admin');
const authRoutes = require('./src/routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;
const isDev = process.env.NODE_ENV !== 'production';

// Connect to MongoDB
connectDB();

// ----------------------------------------
// Security headers
// ----------------------------------------
app.use(helmet({
  // Allow Stripe.js and Google Fonts in CSP
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'", // Tailwind config block
        'https://cdn.tailwindcss.com',
        'https://js.stripe.com',
        'https://unpkg.com',  // Leaflet.js + AOS
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        'https://fonts.googleapis.com',
        'https://cdn.tailwindcss.com',
        'https://unpkg.com',  // Leaflet CSS
      ],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      frameSrc: ['https://js.stripe.com'],
      connectSrc: [
        "'self'",
        'https://api.stripe.com',
        'https://nominatim.openstreetmap.org',  // Geocoding
      ],
      imgSrc: [
        "'self'",
        'data:',
        'https://*.basemaps.cartocdn.com',  // Dark map tiles
        'https://*.tile.openstreetmap.org', // Fallback tiles
      ],
    },
  },
}));

// ----------------------------------------
// CORS — lock to your domain in production via CORS_ORIGIN env var
// ----------------------------------------
app.use(cors({
  origin: process.env.CORS_ORIGIN || `http://localhost:${PORT}`,
  optionsSuccessStatus: 200,
}));

// ----------------------------------------
// Request logging
// ----------------------------------------
app.use(morgan(isDev ? 'dev' : 'combined'));

// ----------------------------------------
// Body parsing + NoSQL injection protection
// ----------------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(mongoSanitize()); // strips $ and . from req.body / req.query / req.params

// ----------------------------------------
// Rate limiting
// ----------------------------------------
// General API limit: 120 req / 15 min per IP
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
}));

// Tighter limit on payment intent to prevent Stripe abuse: 20 req / 15 min per IP
app.use('/api/orders/create-payment-intent', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many payment attempts, please try again later.' },
}));

// Tighter limit on auth endpoints to prevent brute-force: 20 req / 15 min per IP
app.use('/api/auth', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts, please try again later.' },
}));

// ----------------------------------------
// Static frontend
// ----------------------------------------
app.use(express.static(path.join(__dirname, 'public')));

// ----------------------------------------
// API Routes
// ----------------------------------------
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Raymah Café API is running' });
});

// Frontend config — exposes safe public keys only
app.get('/api/config', (req, res) => {
  res.json({ stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
});

// ----------------------------------------
// 404 handler — must come after all routes
// ----------------------------------------
app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` });
  }
  // For non-API routes, serve index.html (SPA fallback)
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ----------------------------------------
// Error handler (must be last)
// ----------------------------------------
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n☕  Raymah Café server running → http://localhost:${PORT}`);
  console.log(`📦  API available at          → http://localhost:${PORT}/api`);
  console.log(`🔐  Admin dashboard           → http://localhost:${PORT}/admin.html`);
  console.log(`🌱  Seed the database with    → npm run seed\n`);
});
