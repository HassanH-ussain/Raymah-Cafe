require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/errorHandler');

const productRoutes = require('./src/routes/products');
const orderRoutes = require('./src/routes/orders');
const reviewRoutes = require('./src/routes/reviews');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static frontend from /public
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Raymah Café API is running' });
});

// Error handler (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n☕  Raymah Café server running → http://localhost:${PORT}`);
  console.log(`📦  API available at          → http://localhost:${PORT}/api`);
  console.log(`🌱  Seed the database with    → npm run seed\n`);
});
