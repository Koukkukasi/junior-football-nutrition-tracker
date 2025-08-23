// Vercel serverless function handler for the Express backend
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const morgan = require('morgan');

// Create Express app
const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://junior-nutrition-tracker-prod.vercel.app',
  credentials: true
}));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Disable Morgan logging in production Vercel environment
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// User routes (simplified for now)
app.get('/api/v1/users/profile', async (req, res) => {
  // This would normally use Clerk authentication and Prisma
  // For now, return a mock response
  res.status(401).json({
    error: 'Authentication required',
    message: 'Please sign in to access your profile'
  });
});

// Food entries routes
app.get('/api/v1/food-entries', async (req, res) => {
  res.status(401).json({
    error: 'Authentication required',
    message: 'Please sign in to view food entries'
  });
});

app.post('/api/v1/food-entries', async (req, res) => {
  res.status(401).json({
    error: 'Authentication required',
    message: 'Please sign in to create food entries'
  });
});

// Performance metrics routes
app.get('/api/v1/performance-metrics', async (req, res) => {
  res.status(401).json({
    error: 'Authentication required',
    message: 'Please sign in to view performance metrics'
  });
});

// Teams routes
app.get('/api/v1/teams', async (req, res) => {
  res.status(401).json({
    error: 'Authentication required',
    message: 'Please sign in to view teams'
  });
});

// Catch all handler for undefined routes
app.all('/api/*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.url} not found`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Export for Vercel serverless function
module.exports = app;

// Also export as default for Vercel
module.exports.default = app;